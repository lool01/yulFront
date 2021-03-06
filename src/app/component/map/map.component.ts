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
  public avatarList: Avatar[] = [
    new Avatar(1, 29, '../assets/images/snow.png', 0, [[1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], [1, 29], [1, 1], ]), // Snow board !
    new Avatar(15, 26, '../assets/images/person.jpg', 0, [[3, 21], [16, 14], [29, 22]]),
    new Avatar(4, 1, '../assets/images/voiture.png', 1, null),
    new Avatar(1, 10, '../assets/images/voiture.png', 1, null),
    new Avatar(4, 8, '../assets/images/voiture.png', 1, null),
    new Avatar(1, 20, '../assets/images/voiture.png', 1, null),
    new Avatar(28, 1, '../assets/images/voiture.png', 1, null),
    new Avatar(25, 5, '../assets/images/voiture.png', 1, null),
    new Avatar(8, 8, '../assets/images/voiture.png', 1, [[8, 21], 'accident']), // Voiture accident
  ];
  mapResponse: MapModel | undefined;

  private pompierSpawned = false;
  private started = false;
  private rickSpawned = false;

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

    if (second % 30 === 0 && second > 0){
      // toggle the night
      // @ts-ignore
      document.getElementById('journee').classList.toggle('night');
    }

    if (second % 15 === 0 && second > 0 && !this.rickSpawned){
      this.avatarList.push(new Avatar(13, 15, '../assets/images/rick.gif', 0, ["do-nothing"]),
        new Avatar(14, 15, '../assets/images/rick.gif', 0, ["do-nothing"]),
        new Avatar(12, 15, '../assets/images/rick.gif', 0, ["do-nothing"]),
        new Avatar(13, 14, '../assets/images/rick.gif', 0, ["do-nothing"]),
        new Avatar(13, 16, '../assets/images/rick.gif', 0, ["do-nothing"]));

      this.rickSpawned = true;
    }

    const hours = Math.floor(second / 60 / 60);
    const minutes = Math.floor(second / 60) - (hours * 60);
    const seconds = second % 60;
    this.timer = hours + 'h :' + minutes + 'm :' + seconds + 's';

    if(!this.started){
      this.started = true;
      this.start();
    }
  }

  displayAvatar(listAvatar: any): void {
    this.avatarList = (listAvatar as Avatar[]);
  }

  start(): void{
    this.loop();
  }

  // @ts-ignore
  loop() {
    for (const avatar of this.avatarList){
      if (avatar.isAccident && !this.pompierSpawned){
        // Spawn a pompier
        this.avatarList.push(new Avatar(8, 1, '../assets/images/firetruck.jpg', 1, [[avatar.x, avatar.y], 'save', [8, 1], 'disapear']));
        this.pompierSpawned = true;
      }

      if (avatar.positionsToGo){
        // Main person
        const nextPos = avatar.positionsToGo[avatar.currentObjective];
        if (Array.isArray(nextPos)){
          this.mapService.getPathfinding(avatar.type, avatar.x, avatar.y, nextPos[0], nextPos[1]).then(pos => {
            if (pos){
              this.updateAvatar(pos, avatar);
            }
          });
        }else if (nextPos === 'accident'){
          avatar.image = '../assets/images/voiture-accident.png';
          avatar.isAccident = true;
        }else if (nextPos === 'save'){
          // save the car in fire
          for (const avatar2 of this.avatarList){
            if (avatar2.x === avatar.x && avatar2.y === avatar.y){
              avatar2.isAccident = false;
              avatar2.image = '../assets/images/voiture.png';
              avatar2.positionsToGo = null;
            }
          }
        }else if (nextPos === 'disapear') {
          // remove the avatar
          this.avatarList.splice(this.avatarList.indexOf(avatar), 1);
          continue;
        }
      } else{
        // Voiture
        if (avatar.currentDirection == null){
          // Decide a direction
          // @ts-ignore
          avatar.currentDirection = 3;
        }

        // If at intersection, randomly change direction
        // @ts-ignore
        if (this.mapResponse.square[avatar.y][avatar.x].image === '../assets/images/croisement.png'){
          console.log('INTERSECTION !');
          do{
            // @ts-ignore
            avatar.currentDirection = this.getRndInteger(1, 4);

            // tslint:disable-next-line:no-shadowed-variable
            let newPos = null;

            if (avatar.currentDirection === 1){
              // go up
              newPos = [{x: avatar.x, y: avatar.y - 1}];
            }else if (avatar.currentDirection === 2){
              // go right
              newPos = [{x: avatar.x + 1, y: avatar.y}];
            }else if (avatar.currentDirection === 3){
              // go down
              newPos = [{x: avatar.x, y: avatar.y + 1}];
            }else if (avatar.currentDirection === 4){
              // go left
              newPos = [{x: avatar.x - 1, y: avatar.y}];
            }

            // Check if positionOk
            // @ts-ignore
            if (this.mapResponse.square[newPos[0].y][newPos[0].x].value !== 1){
              avatar.currentDirection = null;
            }

          }while (avatar.currentDirection == null);
        }

        let newPos = null;

        if (avatar.currentDirection === 1){
          // go up
          newPos = [{x: avatar.x, y: avatar.y - 1}];
          if (newPos[0].y < 0){
            // @ts-ignore
            avatar.currentDirection = 3; // down
            continue;
          }
        }else if (avatar.currentDirection === 2){
          // go right
          newPos = [{x: avatar.x + 1, y: avatar.y}];
          if (newPos[0].x >= 30){
            // @ts-ignore
            avatar.currentDirection = 4; // left
            continue;
          }
        }else if (avatar.currentDirection === 3){
          // go down
          newPos = [{x: avatar.x, y: avatar.y + 1}];

          if (newPos[0].y >= 30){
            // @ts-ignore
            avatar.currentDirection = 1; // up
            continue;
          }
        }else if (avatar.currentDirection === 4){
          // go left
          newPos = [{x: avatar.x - 1, y: avatar.y}];
          if (newPos[0].y < 0){
            // @ts-ignore
            avatar.currentDirection = 2; // right
            continue;
          }
        }

        // for(var x = 0; x < 30; x++){
        //   console.log(this.mapResponse.square[x]);
        // }

        // Check if positionOk
        // @ts-ignore
        if (this.mapResponse.square[newPos[0].y][newPos[0].x].value !== 1){
          newPos = null;
        }

        if (newPos){
          this.updateAvatar(newPos, avatar);
        }
      }

    }

    setTimeout(() => this.loop(), 1000);
  }

  getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) ) + min;
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
  }
}
