import { Component, Input, OnInit } from '@angular/core';
import 'rxjs/add/operator/delay';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PostService } from '../services/post.service';
import { Post } from '../models/post.model';
import { debug } from 'util';
import { PaginatedItem } from '../../shared/models/paginateditem.model';
import * as fromPost from '../store/reducers';
import * as postAction from '../store/actions/post.action';

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./style.css']
})
export class NewsFeedComponent implements OnInit {
  posts$: Observable<Post[]>;

  posts: Post[] = [];
  searchTerm: string;
  page: number;
  toggleAddPost: boolean;

  constructor(
    private postService: PostService
  ) {
    this.page = 0;   
  }

  ngOnInit(): void {   
    this.loadPosts();
  }

  listenSearchEvent(searchTerm: string) {
    this.searchTerm = searchTerm;
  }
  postCreatedListen(post: Post) {   
     this.posts.push(post);    
  }


  loadPosts(): void {
    this.page += 1;
    this.postService
      .getPosts(this.page)
      .subscribe((result: PaginatedItem<Post>) => {
        if (result.items.length > 0) {
          this.posts.push(...result.items);        
        }
      });
  }

  onScrollDown() {
    this.loadPosts();
  }

  handleToggleAddPost(){
    this.toggleAddPost = !this.toggleAddPost;
  }
}
