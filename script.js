const slider=document.getElementById('compare');
const after=document.querySelector('.after-wrap');
const handle=document.querySelector('.handle');
if(slider&&after&&handle){
  slider.addEventListener('input',()=>{
    after.style.width=slider.value+'%';
    handle.style.left=slider.value+'%';
  });
}
