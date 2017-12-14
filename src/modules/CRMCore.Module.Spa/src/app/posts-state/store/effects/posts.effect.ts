import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { normalize, schema } from 'normalizr';

import { PostActionCreators } from '../actions/post.action';
import * as ActionType from '../actions/post-constant-type.action';
import { CommentActionTypes, AddCommentSuccess } from '../actions/comment.action';
import { PostService } from '../../services/post.service';
import { PostState } from '../reducers';
import { postSchema } from '../../models/schema';
import * as fromPost from '../../store/reducers';
import { Post, Comment, AddClapRequest } from '../../models';

import { ClapActionTypes, AddClapSuccess } from '../actions/clap.action';

@Injectable()
export class PostEffects {
  constructor(
    private actions$: Actions,
    private store: Store<PostState>,
    private postService: PostService
  ) {}

  @Effect()
  loadPosts$: Observable<Action> = this.actions$
    .ofType(ActionType.LOAD)
    .withLatestFrom(this.store)
    .map((latest: any[]) => latest[1])
    .filter((store: any) => !store.PostFeature.posts.loading)
    .mergeMap(store => {
      return this.postService
        .getPosts(store.PostFeature.posts.currentPage)
        .map(res =>
          PostActionCreators.loadSuccess(normalize(res.items, [postSchema]))
        )
        .catch(error => of(PostActionCreators.loadFail(error)));
    });

  @Effect()
  loadPostsStarted$: Observable<Action> = this.actions$
    .ofType(ActionType.LOAD)
    .withLatestFrom(this.store)
    .map((latest: any[]) => latest[1])
    .filter((store: any) => !store.PostFeature.posts.loading)
    .map(() => PostActionCreators.loadStarted());

  @Effect()
  addPost$ = this.actions$
  .ofType(ActionType.ADD_POST)
  .switchMap((post: any) =>
    this.postService
      .createPost(post.payload)
      .map(res => PostActionCreators.addPostSucess(res))
      .catch(error => of(PostActionCreators.addPostFail(error)))
  );

  @Effect()
  removePost$: Observable<Action> = this.actions$
    .ofType(ActionType.REMOVE_POST)
    .map(toPayload)
    .switchMap((postId: string) => {
      const id = postId;
      return this.postService
        .deletePost(postId)
        .map(() => PostActionCreators.removePostSuccess(id));
    });

  @Effect()
  addComment$ = this.actions$
    .ofType(CommentActionTypes.ADD_COMMENT)
    .map(toPayload)
    .switchMap((comment: Comment) =>
      this.postService
        .addComment(comment)
        .map(res => new AddCommentSuccess(res))
    );

  @Effect()
  addClap$ = this.actions$
    .ofType(ClapActionTypes.ADD_CLAP)
    .map(toPayload)
    .switchMap((clap: AddClapRequest) => {
      const clapReq = clap;
      return this.postService
        .addClap(clapReq)
        .map(res => new AddClapSuccess(res));
    });
}
