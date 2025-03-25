import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  post: Post = { id: null, title: '', content: '' };
  posts: Post[] = []; 
  Loading = false;
  private postId: string | null = null;
  mode: 'create' | 'edit' = 'create';

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        if (this.postId) {
          this.Loading = true;
          this.postsService.getPost(this.postId).subscribe(postData => {
            this.Loading = false;
            this.post = {
              id: postData.id,
              title: postData.title,
              content: postData.content
            };
          });
        }
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });

    this.postsService.getPosts();
    this.postsService.getPostUpdatedListener().subscribe((posts: Post[]) => {
      this.posts = posts;
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) return;

    if (this.mode === 'create') {
      this.postsService.addPost(form.value.title, form.value.content);
    } else {
      this.postsService.updatePost(this.postId!, form.value.title, form.value.content);
    }

    form.resetForm();
  }
}
