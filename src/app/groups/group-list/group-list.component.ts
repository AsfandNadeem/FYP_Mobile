import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDrawer, PageEvent} from '@angular/material';
import {BehaviorSubject, Subscription} from 'rxjs';
import io from 'socket.io-client';
import { Group } from '../group.model';
import { GroupsService } from '../groups.service';
import {AuthService} from '../../auth/auth.service';
import {EventsService} from '../../events/events.service';
import {Events} from '../../events/event.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit, OnDestroy {
  screenWidth: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
  groups: Group[] = [];
  // groupsjoined: Group[] = [];
  events: Events[] = [];
   isLoading = false;
   totalGroups = 0;
   groupsPerPage = 5;
   currentPage = 1;
   username: string;
   userId: string;
  socketHost: any;
  socket: any;
   // newComment = [];
   pageSizeOptions = [1, 2, 5, 10];
   userIsAuthenticated = false;
   private groupsSub: Subscription;
   private authStatusSub: Subscription;
  // private groupsjoinedSub: Subscription;
  private eventsSub: Subscription;
  @ViewChild('mat-drawer') sidenav: MatDrawer;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth$.next(event.target.innerWidth);
  }
   constructor(public groupsService: GroupsService, private authService: AuthService,
               private eventsService: EventsService) {
     this.socket = io('https://comsatsconnectbackend.herokuapp.com');
   }

   ngOnInit() {
     this.screenWidth$.subscribe(width => {
       this.screenWidth = width;
     });



     this.isLoading = true;
     this.groupsService.getGroups(this.groupsPerPage, this.currentPage );
     this.userId = this.authService.getUserId();
     this.username = this.authService.getName();
     this.groupsSub = this.groupsService.getGroupUpdateListener()
       .subscribe((groupData: { groups: Group[], groupCount: number}) => {
         this.isLoading = false;
         this.totalGroups = groupData.groupCount;
         this.username = this.authService.getName();
         this.groups = groupData.groups;
         console.log(this.groups);
       });
     this.userIsAuthenticated = this.authService.getIsAuth();
     this.authStatusSub = this.authService
       .getAuthStatusListener()
       .subscribe(isAuthenticated => {
         this.userIsAuthenticated = isAuthenticated;
         this.userId = this.authService.getUserId();
       });

     console.log(this.eventsService.getJoinedEvents());
     this.eventsSub = this.eventsService.getEventUpdateListener()
       .subscribe((eventData: { events: Events[]}) => {
         this.isLoading = false;
         this.events = eventData.events;
         console.log(this.events);
       });
   }

   ngOnDestroy() {
     this.groupsSub.unsubscribe();
     this.authStatusSub.unsubscribe();
   }
  //
  //  onDelete(postId: string) {
  //    this.isLoading = true;
  // this.postsService.deletePost(postId).subscribe(() => {
  //   this.postsService.getPosts(this.postsPerPage, this.currentPage);
  //    });
  //  }
  //

   onChangedPage(pageData: PageEvent) {
     this.isLoading = true;
     this.currentPage = pageData.pageIndex + 1;
     this.groupsPerPage = pageData.pageSize;
     this.groupsService.getGroups(this.groupsPerPage, this.currentPage );
   }

  onJoin(id: string) {
    this.groupsService.requestGroup(id).subscribe(() => {
      this.socket.emit('refresh', {});
    this.groupsService.getGroups(this.groupsPerPage, this.currentPage );
          });
  }



}
