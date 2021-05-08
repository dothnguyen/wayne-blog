export class UserProfile {
  id: string;
  userName: string;
  email: string;
  avatarURL: string;
}

export class Post {
         constructor(
           public id: number = 0,
           public title: string = '',
           public content: string = '',
           public publish: number = 1,
           public publishDate: Date = null,
           public lastUpdatedDate: Date = null,
           public tags: Array<string> = [],
           public userId: string = '',
           public isPublish: boolean = false,
           public userName: string = '',
           public avatarUrl: string = ''
         ) {}
       }
