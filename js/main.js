window.onload=function(){
	var data_q=[
		[0,3,0,0,0,2,8,0,0],[0,4,8,9,3,1,0,0,0],[0,6,2,4,0,5,0,7,0],
		[0,2,5,0,0,0,1,0,6],[8,9,0,4,1,0,2,5,3],[0,0,3,5,2,0,7,9,4],
		[2,0,1,0,7,0,6,0,0],[0,8,5,1,0,0,0,7,0],[9,3,0,8,5,6,2,4,1]
	]
	var data_a=[
		[5,3,9,7,6,2,8,1,4],[7,4,8,9,3,1,5,6,2],[1,6,2,4,8,5,3,7,9],
		[4,2,5,3,9,7,1,8,6],[8,9,7,4,1,6,2,5,3],[6,1,3,5,2,8,7,9,4],
		[2,4,1,9,7,3,6,5,8],[6,8,5,1,2,4,3,7,9],[9,3,7,8,5,6,2,4,1]
	]
	var panel=document.querySelector('.panel');
	init(panel);
	var current=null;
	var cells=document.getElementsByClassName('cell');
	var btns=document.querySelector('.btns');
	var btnBlock=document.querySelector('.block');
	var btnshowI=document.querySelector('.show-i');
	var btnShowG=document.querySelector('.show-g');
	var btnHint=document.querySelector('.hint');
	var btnMenu=document.querySelector('.menu');
	var btnErase=document.querySelector('.erase');
	var btnNotes=document.querySelector('.notes');
	document.body.onkeydown=function(e){
		if(!current)
			return;
		if(e.keyCode==46&&!current.classList.contains('fixed')){
			current.innerHTML=`<div class="mask"></div>`;
			current.classList.remove('mutable');
			current.classList.add('blank');
		}
	}
	document.body.onkeypress=function(e){
		if(!current)
			return;
		if(e.charCode>=49&&e.charCode<=57&&(current.classList.contains('blank')||current.classList.contains('mutable'))){
			var number=String.fromCharCode(e.charCode);
			current.innerHTML=`${number}<div class="mask"></div>`;
			current.classList.remove('blank');
			current.classList.add('mutable');
			syncData(current);
			if(!document.querySelector('.blank')){
				if(checkSuccess())
					showDialog();
			}
		}
	}
	panel.onclick=function(e){
		var target=null;
		if(e.target.classList.contains('mask')){
			target=e.target.parentNode;
		}else if(e.target.classList.contains('cell')){
			target=e.target;
		}else
			return;
		if(target.classList.contains('fixed')){
			focusSame(target);
		}else if(target.classList.contains('mutable')){
			focusAndMask(target);
		}else{
			maskRC(target);
		}
		current=target;
	}
	btns.onclick=function(e){
		if(!current||current.classList.contains('fixed'))
			return;
		if(e.target.tagName=='BUTTON'){
			var number=e.target.innerHTML;
			current.innerHTML=`${number}<div class="mask"></div>`;
			current.classList.remove('blank');
			current.classList.add('mutable');
		}
	}
	btnErase.onclick=function(){
		if(!current)
			return;
		if(!current.classList.contains('fixed')){
			current.innerHTML=`<div class="mask"></div>`;
			current.classList.remove('mutable');
			current.classList.add('blank');
		}
	}
	function init(panel){
		data_q.forEach(function(bval,bid){
			var block=document.createElement('div');
			block.classList.add('block');
			block.dataset.bid=bid;
			bval.forEach(function(cval,cid){
				var cell=document.createElement('div');
				cell.classList.add('cell');
				cell.dataset.cid=cid;
				if(cval!=0){
					cell.classList.add('fixed');
					cell.innerHTML=cval;
				}else{
					cell.classList.add('blank');
					cell.innerHTML='';
				}
				block.appendChild(cell);
				var mask=document.createElement('div');
				mask.classList.add('mask');
				cell.appendChild(mask);
			})
			panel.appendChild(block);
		})
	}
	function focusSame(target){
		var focused=document.getElementsByClassName('focus');
		[...focused].forEach(function(item){
			item.classList.remove('focus')
		});
		var masked=document.getElementsByClassName('masked');
		[...masked].forEach(function(item){
			item.classList.remove('masked')
		});
		[...cells].forEach(function(item){
			if(item.textContent==target.textContent){
				item.classList.add('focus');
			}
		})
	}
	function maskRC(target){
		var bid=Number(target.parentNode.dataset.bid);
		var cid=Number(target.dataset.cid);
		var focused=document.getElementsByClassName('focus');
		[...focused].forEach(function(item){
			item.classList.remove('focus')
		});
		var masked=document.getElementsByClassName('masked');
		[...masked].forEach(function(item){
			item.classList.remove('masked')
		});
		var temp=[...cells].filter(function(item){
			if(Number(item.parentNode.dataset.bid)%3==bid%3&&Number(item.dataset.cid)%3==cid%3)
				return true;
			if(Math.floor(item.parentNode.dataset.bid/3)==Math.floor(bid/3)&&Math.floor(item.dataset.cid/3)==Math.floor(cid/3))
				return true;
		})
		temp.forEach(function(item){
			item.classList.add('masked');
		})
		target.classList.add("focus");
	}
	function focusAndMask(target){
		var bid=Number(target.parentNode.dataset.bid);
		var cid=Number(target.dataset.cid);
		var focused=document.getElementsByClassName('focus');
		[...focused].forEach(function(item){
			item.classList.remove('focus')
		});
		var masked=document.getElementsByClassName('masked');
		[...masked].forEach(function(item){
			item.classList.remove('masked')
		});
		[...cells].forEach(function(item){
			if(item.textContent==target.textContent){
				item.classList.add('focus');
			}
		})
		var temp=[...cells].filter(function(item){
			if(Number(item.parentNode.dataset.bid)%3==bid%3&&Number(item.dataset.cid)%3==cid%3)
				return true;
			if(Math.floor(item.parentNode.dataset.bid/3)==Math.floor(bid/3)&&Math.floor(item.dataset.cid/3)==Math.floor(cid/3))
				return true;
		})
		temp.forEach(function(item){
			item.classList.add('masked');
		})
	}
	function syncData(current){
		var bid=current.parentNode.dataset.bid;
		var cid=current.dataset.cid;
		data_q[bid][cid]=Number(current.innerHTML);
	}
	function checkSuccess(){
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if(data_q[i][j]!=data_a[i][j])
					return false;
			}
		}
		return true;
	}
	function showDialog(){
		alert('成功了')
	}

}