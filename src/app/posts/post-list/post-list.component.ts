import { Component } from "@angular/core";

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css'],

    })
export class PostlistComponent{
    panelOpenState = false;
    post=[
        {title: '1st title', content: '1st content'},
    ]
}