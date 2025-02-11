import { Component, Input } from "@angular/core";


@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css'],

    })
        export class PostlistComponent{
        
            @Input() posts = [
                {title: '1st title', content: '1st content'},
            ]
}