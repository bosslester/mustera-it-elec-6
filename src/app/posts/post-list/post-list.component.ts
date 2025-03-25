import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    private postsSub!: Subscription;
    Loading: boolean =false;
    constructor(public postsService: PostsService){
    }
    ngOnInit(){
        this.Loading = true;
        this.postsService.getPosts();
        this.postsSub = this.postsService.getPostUpdatedListener()
        .subscribe((posts: Post[])=>{
            this.Loading = false;
            this.posts = posts;
        });
    }
    onDelete(postId: string) {
        this.postsService.deletePost(postId);
    }
    ngOnDestroy() {
        this.postsSub.unsubscribe();
    }
}
