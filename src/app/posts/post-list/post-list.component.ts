import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  totalposts = 10;
  postperpage = 2;
  pageSizeOption = [1, 2, 5, 10];
  posts: Post[] = [];
  private postsSub!: Subscription;
  private authStatusSub!: Subscription;
  Loading: boolean = false;
  userIsAuthenticated: boolean | undefined;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.Loading = true;
    this.postsService.getPosts(this.postperpage, 1);
    this.postsSub = this.postsService
      .getPostUpdatedListener()
      .subscribe((postData: { posts: Post[]; totalPosts: number }) => {
        this.Loading = false;
        this.posts = postData.posts;
        this.totalposts = postData.totalPosts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); 
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.Loading = true;
    const newPage = pageData.pageIndex + 1;
    this.postperpage = pageData.pageSize;
    this.postsService.getPosts(this.postperpage, newPage);
    console.log(pageData);
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}