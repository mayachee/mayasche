/* Browser-test fixture: simulates the provider contract, not actual playback. */
window.YT={Player:class{
 constructor(id,options){this.options=options;this.volume=100;this.calls=0;this.state=-1;const frame=document.createElement('iframe');frame.id=id;frame.src='about:blank';frame.width=options.width;frame.height=options.height;document.getElementById(id).replaceWith(frame);this.frame=frame;window.__recordingTest=this;setTimeout(()=>options.events.onReady({target:this}),0);}
 getIframe(){return this.frame;}
 setVolume(value){this.volume=value;}
 unMute(){}
 playVideo(){this.calls++;if(this.calls===1){this.options.events.onAutoplayBlocked({target:this});return;}this.state=1;this.options.events.onStateChange({data:1,target:this});}
 pauseVideo(){this.state=2;this.options.events.onStateChange({data:2,target:this});}
}};
window.onYouTubeIframeAPIReady();
