// eslint-disable-next-line no-undef
const myText = document.getElementById("chat-text-input");
myText.style.cssText = `height: ${myText.scrollHeight}px; overflow-y:scroll; max-height:300px; min-height:40px`;
myText.addEventListener('input',function(){
this.style.height ='auto';
this.style.height =`${this.scrollHeight}px`;
});