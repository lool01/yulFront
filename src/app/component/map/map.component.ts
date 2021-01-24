import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProgressWebsocketService} from '../../service/progress.websocket.service';
import {Avatar} from 'src/model/avatar';
import {ActivatedRoute} from '@angular/router';
import {MapService} from '../../service/map.service';
import {MapModel} from '../../../model/map';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {

  public title = 'Using WebSocket under Angular';
  private obs: any;
  public timer: string | undefined;
  public avatarList: Avatar[] = [new Avatar(1, 1, '../assets/images/avatar.png', 0)];
  mapResponse: MapModel | undefined;

  constructor(private router: ActivatedRoute, private progressWebsocketService: ProgressWebsocketService, private mapService: MapService) {
    router.params.subscribe(val => {
      this.initProgressWebSocket();
      this.mapService.getMapById(val.id).subscribe(map => {
          this.mapResponse = map;
          console.log(this.mapResponse);
        },
        error => {
          this.mapResponse = undefined;
          console.log(error.message);
        }
      );
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  /**
   * Subscribe to the client broker.
   * Return the current status of the batch.
   */
  private initProgressWebSocket = () => {
    this.obs = this.progressWebsocketService.getObservable();

    this.obs.subscribe({
      next: this.onNewProgressMsg,
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  /**
   * Apply result of the java server notification to the view.
   */
  private onNewProgressMsg = (receivedMsg: { type: string; message: any; }) => {
    if (receivedMsg.type === 'SUCCESS') {
      if (receivedMsg.message instanceof Object) {
        this.displayAvatar(receivedMsg.message);
      } else {
        this.displayTime(receivedMsg.message);
      }
    }
  }

  display(x: number, y: number, avatar: any): boolean {
    if (avatar.x === x && avatar.y === y) {
      return true;
    }
    return false;
  }

  display2(x: number, y: number, avatars: Avatar[]): string | undefined {
    if (avatars !== undefined) {
      const found = avatars.find(element => element.y === y && element.x === x);

      if (found !== undefined) {
        return found.image;
      }
    }
    return '../assets/images/vide.png';
  }


  displayTime(second: number): void {
    const hours = Math.floor(second / 60 / 60);
    const minutes = Math.floor(second / 60) - (hours * 60);
    const seconds = second % 60;
    this.timer = hours + 'h :' + minutes + 'm :' + seconds + 's';

    // update everything



  }

  displayAvatar(listAvatar: any): void {
    this.avatarList = (listAvatar as Avatar[]);
  }

  start(): void{
    if (this.avatarList === undefined){
      this.avatarList = [new Avatar(1, 1, '../assets/images/avatar.png', 0)];
    }

    for (const avatar of this.avatarList){
      console.log(avatar.positionsToGo[avatar.currentObjective]);
      const nextPos = avatar.positionsToGo[avatar.currentObjective];
      if (nextPos){
        this.mapService.getPathfinding(avatar.x, avatar.y, nextPos[0], nextPos[1]).then(pos => {
          if (pos){
            this.updateAvatar(pos, avatar);
          }
        });
      }
    }

  }

  updateAvatar(pos: any, avatar: Avatar): void{
    console.log('=================');
    if (pos.length === 0){
      avatar.currentObjective++;
    }
    else{
      avatar.x = pos[0].x;
      avatar.y = pos[0].y;
      this.mapService.setAvatar(this.avatarList);
    }
    setTimeout(() => this.start(), 1000);

  }
}
