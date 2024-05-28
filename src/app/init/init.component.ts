import { Component, OnInit } from '@angular/core';
import { InitService } from '../init.service';

@Component({
  selector: 'app-init',
  templateUrl: './init.component.html',
  styleUrls: ['./init.component.css']
})
export class InitComponent implements OnInit {

  constructor(private initService: InitService) { }

  ngOnInit(): void {
    this.initDatabase();
  }

  initDatabase(): void {
    this.initService.initializeDatabase().subscribe(
      (response) => {
        console.log('Database initialized:', response);
        // Handle response as needed
      },
      (error) => {
        console.error('Error initializing database:', error);
        // Handle error as needed
      }
    );
  }
}
