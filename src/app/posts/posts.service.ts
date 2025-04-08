import { Injectable } from "@angular/core";
import { Subject, Observable, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Router } from "@angular/router";
import { map, catchError } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(pagesize: number, currentpage: number) {
        const queryParams = `?pagesize=${pagesize}&currentpage=${currentpage}`;  
        this.http.get<{ message: string, posts: any, totalPosts: number }>(
            'http://localhost:3000/api/posts' + queryParams
        ).pipe(
            map((postData) => {
                return {
                    posts: postData.posts.map((post: any) => ({
                        id: post._id,
                        title: post.title,
                        content: post.content,
                        imagePath: post.imagePath
                    })),
                    totalPosts: postData.totalPosts
                };
            }),
            catchError(error => {
                console.error("Error fetching posts:", error);
                return throwError(() => error);
            })
        ).subscribe((transformedData) => {
            this.posts = transformedData.posts;
            this.postsUpdated.next({
                posts: [...this.posts], 
                totalPosts: transformedData.totalPosts
            });
        });
    }

    getPostUpdatedListener(): Observable<{ posts: Post[], totalPosts: number }> {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string): Observable<Post> {
        return this.http.get<{ _id: string; title: string; content: string; imagePath: string }>(
            `http://localhost:3000/api/posts/${id}`
        ).pipe(
            map(postData => ({
                id: postData._id,
                title: postData.title,
                content: postData.content,
                imagePath: postData.imagePath
            })),
            catchError(error => {
                console.error("Error fetching post:", error);
                return throwError(() => error);
            })
        );
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);

        this.http
            .post<{ message: string; post: Post }>(
                'http://localhost:3000/api/posts',
                postData
            )
            .subscribe({
                next: (responseData) => {
                    const post: Post = {
                        id: responseData.post.id,
                        title: title,
                        content: content,
                        imagePath: responseData.post.imagePath
                    };
                    this.posts.push(post);
                    this.postsUpdated.next({ posts: [...this.posts], totalPosts: this.posts.length });
                    this.router.navigate(['/']);
                },
                error: (err) => console.error("Error in addPost:", err)
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: FormData | Post;
        
        if (typeof image === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = { id, title, content, imagePath: image };
        }

        this.http
            .put<{ message: string, post?: Post }>(`http://localhost:3000/api/posts/${id}`, postData)
            .subscribe({
                next: (response) => {
                    const oldPostIndex = this.posts.findIndex(p => p.id === id);
                    if (oldPostIndex !== -1) {
                        this.posts[oldPostIndex] = {
                            id,
                            title,
                            content,
                            imagePath: response.post?.imagePath || this.posts[oldPostIndex].imagePath
                        };
                        this.postsUpdated.next({ posts: [...this.posts], totalPosts: this.posts.length });
                    }
                    this.router.navigate(['/']);
                },
                error: (err) => console.error("Error in updatePost:", err)
            });
    }

    deletePost(postId: string) {
        this.http.delete(`http://localhost:3000/api/posts/${postId}`)
            .subscribe({
                next: () => {
                    this.posts = this.posts.filter(post => post.id !== postId);
                    this.postsUpdated.next({ posts: [...this.posts], totalPosts: this.posts.length });
                    this.router.navigate(["/"]);
                },
                error: (err) => console.error("Error in deletePost:", err)
            });
    }
}