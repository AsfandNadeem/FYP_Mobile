import {Component, Input, OnInit} from '@angular/core';
import {Post} from '../../post.model';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {PageEvent} from '@angular/material';

import {Group} from '../../../groups/group.model';
import {PostsService} from '../../posts.service';
import {GroupsService} from '../../../groups/groups.service';
import {Events} from '../../../events/event.model';
import {EventsService} from '../../../events/events.service';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-userspage',
  templateUrl: './userspage.component.html',
  styleUrls: ['./userspage.component.css']
})
export class UserspageComponent implements OnInit {
  friends = ['Shahid Mehmood', 'Moiz Khalid', 'Zara Khan', 'Ehtesham', 'Mahad Amir'];
  posts: Post[] = [];
  groups: Group[] = [];
  events: Events[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  username: string;
  userId: string;
  @Input() userid: string;
  profileimg: string;
  newComment = [];
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private postsSub: Subscription;
  private groupsSub: Subscription;
  private eventsSub: Subscription;
  private authStatusSub: Subscription;
  constructor(public postsService: PostsService, private authService: AuthService,
              private groupsService: GroupsService, private eventsService: EventsService,
              public route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('userId')) {
        this.userid = paramMap.get('userId');
        console.log(this.userid);
        this.getPosts();
      }
    });
    this.postsService.getuserPosts(this.userid);
    this.userId = this.authService.getUserId();
    // this.username = this.authService.getName();
    console.log(localStorage.getItem('profileimg'));
    this.profileimg = localStorage.getItem('profileimg');
    this.username =  localStorage.getItem('username');
    this.postsSub = this.postsService.getuserPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        // this.username = this.authService.getName();
        this.posts = postData.posts;
        console.log(this.posts);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    console.log(this.groupsService.getJoinedGroups());
    this.groupsSub = this.groupsService.getGroupUpdateListener()
      .subscribe((groupData: { groups: Group[]}) => {
        this.isLoading = false;
        this.groups = groupData.groups;
        console.log(this.groups);
      });

    console.log(this.eventsService.getJoinedEvents());
    this.eventsSub = this.eventsService.getEventUpdateListener()
      .subscribe((eventData: { events: Events[]}) => {
        this.isLoading = false;
        this.events = eventData.events;
        console.log(this.events);
      });
  }

  // onChangedPage(pageData: PageEvent) {
  //   this.isLoading = true;
  //   this.currentPage = pageData.pageIndex + 1;
  //   this.postsPerPage = pageData.pageSize;
  //   this.postsService.getPosts(this.postsPerPage, this.currentPage );
  // }

  likePost(id: string) {
    this.postsService.likePost(id).subscribe( () => {
      this.postsService.getuserPosts(this.userid);
    });
  }

  getPosts() {
    this.postsService.getuserPosts(this.userid);
  }
  // console.log(this.posts.indexOf(post));
  // this.posts[this.posts.indexOf(post)].likes++;
  // if (this.posts[this.posts.indexOf(post)].dislikes === 0 ) {
  //
  //         } else {
  //   this.posts[this.posts.indexOf(post)].dislikes--;
  // }
  // });
  addComment(id: string, comment: string) {
    console.log(id + '\n' + comment);
    if (comment === '') {
      return;
    } else {
      this.postsService.addComment(id, comment).subscribe(() => {
        this.postsService.getuserPosts(this.userid);
      });
    }

  }


  dislikePost(id: string) {
    this.postsService.dislikePost(id).subscribe( () => {
      this.postsService.getuserPosts(this.userid);
    });

  }



}
