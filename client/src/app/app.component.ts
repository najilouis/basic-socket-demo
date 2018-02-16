import { Component, ViewChild, AfterViewChecked, ElementRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://localhost:4001';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked{
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  socket;
  connected: boolean = false;
  username: string = '';
  message: string = '';
  connecting = false;
  messages: Array<string> = [];
 
  constructor(){}

  ngOnInit() { 
    this.scrollToBottom();
  }

  ngAfterViewChecked() {        
      this.scrollToBottom();        
  } 

  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  connect(){
    if(this.username){
      this.initSocket();
    }
    else{
      alert('Username is required!');
    }
  }

  initSocket(): void {
      this.connecting = true;
      this.connected = false;
      this.messages = [];
      this.socket = socketIo(SERVER_URL,{reconnection: true,reconnectionAttempts: 10});
      // this.socket.on('reconnect_failed', (err) => {
      //   this.connected = false;
      //   this.connecting = false;
      //   alert('Could not connect to the server!');
      // });
      this.socket.on('connect', (connect) => {
        console.log(connect)
        this.connected = true;
        this.connecting = false;
        this.onMessage().subscribe((data)=>{
          if(typeof(data) != 'undefined' && data.msg && data.sender){
            this.messages.push(data);
          }
        })
      })
  }

  send(){
      if(!this.message){
        alert('Enter a message');
        return;
      }
      this.socket.emit('message', {'sender': this.username, 'msg': this.message});
      this.message = '';
  }

  onMessage(): Observable<any> {
      return new Observable<String>(observer => {
        console.log('message')
          this.socket.on('message', (data: String) => observer.next(data));
      });
  }
}
