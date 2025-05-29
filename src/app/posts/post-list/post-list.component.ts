import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../authentication/auth.service';
import { Comment } from '../post.model';
import { NumberInput } from "@angular/cdk/coercion";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  pageSize: NumberInput;
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string | null = null;
  searchQuery = '';
  private postsSub!: Subscription;
  private authStatusSub!: Subscription;
  newComments: { [postId: string]: string } = {};

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;

        // Ensure post.creator is string for consistent comparison
        this.posts = postData.posts.map(post => ({
          ...post,
          creator: post.creator ? post.creator.toString() : ''
        }));
      });

    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage, this.searchQuery);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage, this.searchQuery);
    }, () => {
      this.isLoading = false;
    });
  }

  onSearch() {
    this.isLoading = true;
    this.currentPage = 1;
    this.postsService.getPosts(this.postsPerPage, this.currentPage, this.searchQuery);
  }

  onCancelSearch() {
    this.searchQuery = '';
    this.onSearch();
  }

  onAddComment(post: Post) {
    const text = this.newComments[post.id]?.trim();
    if (!text) return;
    this.postsService.addComment(post.id, text).subscribe((res: { comment: any; }) => {
      if (!post.comments) post.comments = [];
      post.comments.push({
        ...res.comment,
        creator: this.userId || '',
        createdAt: new Date().toISOString(),
        reactions: { like: 0, love: 0, laugh: 0, sad: 0 },
      });
      this.newComments[post.id] = '';
    });
  }

  onDeleteComment(post: Post, comment: Comment) {
    this.postsService.deleteComment(post.id, comment._id!).subscribe(() => {
      if (post.comments) {
        post.comments = post.comments.filter((c: Comment) => c._id !== comment._id);
      }
    });
  }

  onReactToPost(post: Post, type: string) {
    this.postsService.reactToPost(post.id, type).subscribe((res: { message: string; reactions: any; userReaction: string | null; }) => {
      post.reactions = res.reactions;
      post.userReaction = res.userReaction ?? undefined;
    });
  }

  onReactToComment(post: Post, comment: Comment, type: string) {
    this.postsService.reactToComment(post.id, comment._id!, type).subscribe(res => {
      comment.reactions = res.reactions;
      comment.userReaction = res.userReaction ?? undefined;
    });
  }

  getTotalReactions(post: Post): number {
    if (!post.reactions) return 0;
    return post.reactions.like + post.reactions.love + post.reactions.laugh + post.reactions.sad;
  }

  getTotalCommentReactions(comment: Comment): number {
    if (!comment.reactions) return 0;
    return comment.reactions.like + comment.reactions.love + comment.reactions.laugh + comment.reactions.sad;
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
