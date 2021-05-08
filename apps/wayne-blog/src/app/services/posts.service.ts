import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Post } from '../models/models';
import { defer, from, BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { ServiceResult, ResultCode } from '../models/serviceresult';
import { PagedResult } from '../models/pagedresult';
import { SortParam } from '../models/sortparam';
import { BASE_API_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  //POST_ENPOINT = 'http://localhost:5000/api/posts';
  POST_ENPOINT = `${BASE_API_URL}/posts`;

  constructor(private http: HttpClient) {}

  savePost(post: Post) {
    if (!post.id) {
      return this.http.post(`${this.POST_ENPOINT}`, post);
    } else {
      return this.http.put(`${this.POST_ENPOINT}/${post.id}`, post);
    }
  }

  getPosts(
    pageIdx: number,
    pageSize: number,
    sort: SortParam,
    searchTerm: string,
    tags: Array<string>
  ): Observable<PagedResult<Post>> {
    const sortKeys = Object.keys(sort);
    if (sortKeys && sortKeys.length) {
      var sortName = sortKeys[0];
      var sortDir = sort[sortName];
    }

    const params = new HttpParams({
      fromObject: {
        page: pageIdx.toString(),
        pageSize: pageSize.toString(),
        sort: sortName,
        order: sortDir.toString(),
        searchTerm: searchTerm,
        tags: tags
      }
    });

    return this.http
      .get<ServiceResult>(`${this.POST_ENPOINT}`, { params: params })
      .pipe(
        map(ret => {
          if (ret.code === ResultCode.OK) {
            return ret.result as PagedResult<Post>;
          } else {
            return null as PagedResult<Post>;
          }
        })
      );
  }

  getPost(id): Observable<Post> {
    return this.http.get<Post>(`${this.POST_ENPOINT}/${id}`);
  }

  getTags(): Observable<Array<string>> {
    return this.http.get<ServiceResult>(`${this.POST_ENPOINT}/getTags`).pipe(
      map(ret => {
        if (ret.code === ResultCode.OK) {
          return ret.result as Array<string>;
        } else {
          return [];
        }
      })
    );
  }

  getTagCounts(): Observable<Array<any>> {
    return this.http
      .get<ServiceResult>(`${this.POST_ENPOINT}/getTagCounts`)
      .pipe(
        map(ret => {
          if (ret.code === ResultCode.OK) {
            return ret.result as Array<any>;
          } else {
            return [];
          }
        })
      );
  }
}
