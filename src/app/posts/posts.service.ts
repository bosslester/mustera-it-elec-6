import { Injectable } from "@angular/core";
import { Subject, Observable, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Router } from "@angular/router";
import { map, catchError } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class PostsService {
    posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts() {
        this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
            .pipe(
                map((postData) => {
                    return postData.posts.map((post: any) => ({
                        id: post._id,
                        title: post.title,
                        content: post.content
                    }));
                }),
                catchError(error => {
                    console.error("Fetching posts failed!", error);
                    return throwError(error);
                })
            )
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts;
                this.postsUpdated.next([...this.posts]);
            });
    }

    getPostUpdatedListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string): Observable<Post> {
        return this.http.get<{ _id: string; title: string; content: string }>(`http://localhost:3000/api/posts/${id}`)
            .pipe(
                map(postData => {
                    if (!postData) {
                        throw new Error("Post not found!");
                    }
                    return {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content
                    };
                }),
                catchError(error => {
                    console.error("Error fetching post:", error);
                    return throwError(() => new Error("Error fetching post"));
                })
            );
    }
    addPost(title: string, content: string) {
        const post: Post = { id: null, title: title, content: content };
        this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
            .subscribe({
                next: (responseData) => {
                    console.log("Post added:", responseData);
                    const id = responseData.postId;
                    post.id = id;
                    this.posts.push(post);
                    this.postsUpdated.next([...this.posts]);
                    this.router.navigate(["/"]);
                }
            });
    }
    

    updatePost(id: string, title: string, content: string) {
        const post: Post = { id, title, content };
        this.http.put(`http://localhost:3000/api/posts/${id}`, post)
            .subscribe({
                next: (response) => {
                    console.log("Post updated successfully:", response);
                    const updatedPosts = [...this.posts];
                    const index = updatedPosts.findIndex(p => p.id === id);
                    if (index !== -1) {
                        updatedPosts[index] = post;
                        this.posts = updatedPosts;
                        this.postsUpdated.next([...this.posts]);
                    } else {
                        console.error("Post ID not found in local array!");
                    }
    
                    this.router.navigate(["/"]);
                },
                error: (error) => console.error("Error updating post:", error)
            });
    }
    

    deletePost(postId: string) {
        this.http.delete(`http://localhost:3000/api/posts/${postId}`)
            .subscribe(() => {
                console.log('Deleted');
                this.posts = this.posts.filter(post => post.id !== postId);
                this.postsUpdated.next([...this.posts]);
            });
    }
}
