import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MapModel} from '../../model/map';
import {Avatar} from '../../model/avatar';

@Injectable({
  providedIn: 'root'
})
export class MapService {


  constructor(private http: HttpClient) {
  }
  getAvatars(): Observable<Avatar[] | undefined> {
    return this.http.get<Avatar[]>('http://localhost:8080/api/avatar/')
  }
  getMapById(id: string | null): Observable<MapModel> {
    return this.http.get<MapModel>('http://localhost:8080/api/map/' + id).pipe(
      map(l => l),
    );
  }

  setAvatar(avatar : Avatar[]){
    console.log(avatar)
    this.http.post('http://localhost:8080​/api​/avatar​/move-avatars', avatar);
  }

  getPathfinding(objectType: number, fromX : number, fromY : number, toX : number, toY : number){
    var url = 'http://localhost:8080/api/map/path-finding/' + objectType +'/' + fromX + "/" + fromY + "/" + toX + "/" + toY + "/";
    return this.http.get<Array<any>>(url).toPromise();;
  }

}
