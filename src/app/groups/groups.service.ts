import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import {Group} from './group.model';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class GroupsService {
  username = "";
  private groups: Group[] = [];
  private groupsUpdated = new Subject<{groups: Group[], groupsCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  //
  //
  // getPosts(postsPerPage: number, currentPage: number) { // httpclientmodule
  //   const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`; // `` backtips are for dynamically adding values into strings
  //  this.http
  //    .get<{message: string, posts: any,  username: string, maxPosts: number}>(
  //      'http://localhost:3000/api/posts' + queryParams
  //    )
  //    .pipe(map((postData) => {
  //      return { posts: postData.posts.map(post => {
  //        return {
  //          title: post.title,
  //          content: post.content,
  //          id: post._id,
  //          username : post.username,
  //          creator: post.creator,
  //          likes: post.likes,
  //          category: post.category,
  //          commentsNo: post.commentsNo,
  //          comments: post.comments,
  //          dislikes: post.dislikes,
  //          createdAt: post.createdAt,
  //          imagePath: post.imagePath
  //        };
  //      }), maxPosts: postData.maxPosts  };
  //   }))// change rterieving data
  //    .subscribe(transformedPostData => {
  //     this.posts = transformedPostData.posts;
  //     this.postsUpdated.next({
  //         posts: [...this.posts],
  //         postCount: transformedPostData.maxPosts
  //       }
  //     );
  //    }); // subscribe is to liosten
  // }
  //
  // getPostUpdateListener() {
  //   return this.postsUpdated.asObservable();
  // }

  addGroup(groupname: string,  category: string, description: string, username: string) {
    return this.http
      .post(
        'http://localhost:3000/api/groups',
        {groupname, description, category, username})
      .subscribe( responseData  => {
        this.router.navigate(['/messages']);
      });
  }

  // getPost(id: string) {
  //   return this.http.get<{
  //     _id: string,
  //     title: string,
  //     content: string,
  //     username: string,
  //     category: string,
  //     creator: string,
  //     imagePath: string
  //   }>('http://localhost:3000/api/posts/' + id) ;
  // }
  //
  // updatePost(id: string , title: string, content: string, image: File | string) {
  //   let postData: Post |FormData ;
  //   if (typeof(image) === 'object') {
  //      postData = new FormData();
  //      postData.append('id', id);
  //     postData.append('title', title);
  //     postData.append('content', content);
  //     postData.append('username', localStorage.getItem('username'));
  //     postData.append('image', image, title);
  //   } else {
  //      postData = {
  //       id: id,
  //       title: title,
  //       content: content,
  //        category: null,
  //        creator: null,
  //        username: localStorage.getItem('username'),
  //       imagePath: image
  //     };
  //
  //   }
  //   this.http.put('http://localhost:3000/api/posts/' + id, postData)
  //     .subscribe(response => {
  //       this.router.navigate(['/messages']);
  //     });
  // }
  //
  // deletePost(postId: string) {
  //   return this.http
  //     .delete('http://localhost:3000/api/posts/' + postId);
  // }
  //
  // // postComment(id, comment) {
  // //   const postData = {
  // //     id: id,
  // //     comment: comment
  // //   };
  // //   return this.http.post('http://localhost:3000/api/posts/comment/' + id, postData);
  // // }
  //
  // likePost(id) {
  //   // @ts-ignore
  //   return this.http.put( 'http://localhost:3000/api/posts/likePost/' + id);
  // }
  //
  // dislikePost(id) {
  //   // @ts-ignore
  //   return this.http.put( 'http://localhost:3000/api/posts/dislikePost/' + id);
  // }
  //
  // addComment(id, comment) {
  //   const postdata = {
  //     id: id,
  //     comment: comment
  //   };
  //   // @ts-ignore
  //   return this.http.put( 'http://localhost:3000/api/posts/comment/' + id, postdata);
  // }
}
