import { Component, OnInit,  ViewChild, HostListener  } from '@angular/core';
import {Post} from '../post.model';
import {BehaviorSubject, Subscription} from 'rxjs';
import {PostsService} from '../posts.service';
import {AuthService} from '../../auth/auth.service';
import {PageEvent} from '@angular/material';
import {GroupsService} from '../../groups/groups.service';
import {EventsService} from '../../events/events.service';
import {Group} from '../../groups/group.model';
import {Events} from '../../events/event.model';
import {MatDrawer} from '@angular/material';
import {NgForm} from '@angular/forms';
import * as moment from 'moment';

export interface Notification {
  created: Date;
  sendername: string;
  message: string;
  senderimage: string;
}
@Component({
  selector: 'app-archivedposts',
  templateUrl: './archivedposts.component.html',
  styleUrls: ['./archivedposts.component.css']
})
export class ArchivedpostsComponent implements OnInit {
  screenWidth: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
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
  profileimg: string;
  newComment = [];
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private postsSub: Subscription;
  private groupsSub: Subscription;
  private eventsSub: Subscription;
  private authStatusSub: Subscription;
  notifications: Notification[] = [];
  private notificationSub: Subscription;
  @ViewChild('mat-drawer') sidenav: MatDrawer;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth$.next(event.target.innerWidth);
  }

  constructor(public postsService: PostsService, private authService: AuthService,
              private groupsService: GroupsService, private eventsService: EventsService) { }

  ngOnInit() {
    this.screenWidth$.subscribe(width => {
      this.screenWidth = width;
    });
    this.isLoading = true;
    this.postsService.getarchivePosts(this.postsPerPage, this.currentPage );
    this.userId = this.authService.getUserId();
    // this.username = this.authService.getName();
    console.log(localStorage.getItem('profileimg'));
    this.profileimg = localStorage.getItem('profileimg');
    this.username =  localStorage.getItem('username');
    this.postsSub = this.postsService.getarchivePostUpdateListener()
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

    this.postsService.getNotifications();
    this.notificationSub = this.postsService.getNotificationUpdateListener()
      .subscribe((notificationData: { notifications: Notification[]}) => {
        this.notifications = notificationData.notifications;
        console.log(this.notifications);
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

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getarchivePosts(this.postsPerPage, this.currentPage );
    document.querySelector('#container').scrollIntoView();
  }

  likePost(id: string) {
    this.postsService.likePost(id).subscribe( () => {
      this.postsService.getarchivePosts(this.postsPerPage, this.currentPage );
    });
  }

  // console.log(this.posts.indexOf(post));
  // this.posts[this.posts.indexOf(post)].likes++;
  // if (this.posts[this.posts.indexOf(post)].dislikes === 0 ) {
  //
  //         } else {
  //   this.posts[this.posts.indexOf(post)].dislikes--;
  // }
  // });
  addComment(post: Post, form: NgForm) {
    console.log(post.id + '\n' + form.value.comment);
    if (form.invalid) {
      return;
    } else {
      this.postsService.addComment(post.id, form.value.comment).subscribe(() => {
        const a = this.posts.indexOf(post);
        this.posts[a].commentsNo++;
        this.posts[a].comments.push({comment: form.value.comment, commentator: this.username});
        //   this.socket.emit('refresh', {});
        // this.postsService.getPosts(this.postsPerPage, this.currentPage);
      });
    }

  }


  dislikePost(id: string) {
    this.postsService.dislikePost(id).subscribe( () => {
      this.postsService.getarchivePosts(this.postsPerPage, this.currentPage );
    });

  }
  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.removearchivePost(postId).subscribe(() => {
      this.postsService.getarchivePosts(this.postsPerPage, this.currentPage);
    });
  }

}
