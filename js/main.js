window.onload=function(){
	var data_q=[
		[0,3,0,0,0,2,8,0,0],[0,4,8,9,3,1,0,0,0],[0,6,2,4,0,5,0,7,0],
		[0,2,5,0,0,0,1,0,6],[8,9,0,4,1,0,2,5,3],[0,0,3,5,2,0,7,9,4],
		[2,0,1,0,7,0,6,0,0],[0,8,5,1,0,0,0,7,0],[9,3,0,8,5,6,2,4,1]
	];
	var data_a=[
		[5,3,9,7,6,2,8,1,4],[7,4,8,9,3,1,5,6,2],[1,6,2,4,8,5,3,7,9],
		[4,2,5,3,9,7,1,8,6],[8,9,7,4,1,6,2,5,3],[6,1,3,5,2,8,7,9,4],
		[2,4,1,9,7,3,6,5,8],[6,8,5,1,2,4,3,7,9],[9,3,7,8,5,6,2,4,1]
	];
	var progress=0;//当前游戏进度
	var level='easy';//当前游戏难度级别
	var length=0;//题库中的题目总数
	var template='<div class="mask"></div><div class="cross"></div>';
	var remain={1:9,2:9,3:9,4:9,5:9,6:9,7:9,8:9,9:9};
	var panel=document.querySelector('.panel');
	var current=null;//当前选中单元格
	var cells=document.getElementsByClassName('cell');
	var btns=document.querySelector('.btns');
	var btnBlock=document.querySelector('.block');
	var btnShowI=document.querySelector('.show-i');
	var btnShowG=document.querySelector('.show-g');
	var btnHint=document.querySelector('.hint');
	var btnHelp=document.querySelector('.help');
	var btnRestart=document.querySelector('.restart');
	var btnNewGame=document.querySelector('.new-game')
	var btnPause=document.querySelector('.pause');
	var btnBack=document.querySelector('.back');
	var btnErase=document.querySelector('.erase');
	var btnNotes=document.querySelector('.notes');
	var action='';//点击对话框的yes按钮时要执行的动作
	var timer=null;
	var seconds=0;//游戏运行时长
	init(panel);
	document.body.onkeydown=function(e){
		var cell=null;
		if(!current)
			return;
		switch(e.keyCode){
			case 8:
			case 46:
			if(!current.classList.contains('fixed')){
				var newval=0;
				var oldval=current.textContent;
				current.innerHTML=template;
				current.classList.remove('mutable');
				current.classList.remove('incorrect')
				current.classList.add('blank');
				syncData(current,newval,oldval);
				return;
			}
			break;
			case 38:
			cell=getCell(current,'top');
			break;
			case 40:
			cell=getCell(current,'bottom');
			break;
			case 37:
			cell=getCell(current,'left');
			break;
			case 39:
			cell=getCell(current,'right');
			break;
			default:
			return;
		}
		if(cell.classList.contains('fixed')){
			focusSame(cell)
		}else if(cell.classList.contains('mutable')){
			focusAndMask(cell)
		}else{
			maskRC(cell);
		}
		current=cell;
		e.preventDefault();
		
	}
	document.body.onkeypress=function(e){
		if(!current)
			return;
		if(e.charCode>=49&&e.charCode<=57&&(current.classList.contains('blank')||current.classList.contains('mutable'))){
			var newval=String.fromCharCode(e.charCode);
			var oldval=current.textContent;
			if(remain[newval]==0||isDuplicates(current,newval)&&btnBlock.dataset.inverse==1)
				return;
			current.innerHTML=newval+template;
			if(!checkCorrect(current)&&btnShowI.dataset.inverse==1)
				current.classList.add('incorrect')
			else
				current.classList.remove('incorrect')
			current.classList.remove('blank');
			current.classList.add('mutable');
			focusAndMask(current);
			syncData(current,newval,oldval);
			if(!document.querySelector('.blank')){
				if(checkSuccess()){
					showDialog();
				}
			}
		}
	}
	panel.onclick=function(e){
		var target=null;
		if(e.target.classList.contains('mask')||e.target.classList.contains('cross')){
			target=e.target.parentNode;
		}else if(e.target.classList.contains('cell')){
			target=e.target;
		}else
			return;
		if(btnErase.dataset.inverse==1&&!target.classList.contains('fixed')){
			var oldval=target.textContent;
			target.innerHTML=template;
			target.classList.remove('incorrect');
			target.classList.remove('mutable');
			target.classList.add('blank');
			syncData(target,0,oldval);
			return;
		}else if(target.classList.contains('fixed')){
			if(btnErase.dataset.inverse==1)
				inverse(btnErase,'erase')
			focusSame(target);
			hideGuides();
		}else if(target.classList.contains('mutable')){
			focusAndMask(target);
		}else{
			maskRC(target);
		}
		current=target;
		if(btnShowG.dataset.inverse==1)
			showGuides(current)
	}
	btns.onclick=function(e){
		if(!current||current.classList.contains('fixed'))
			return;
		if(e.target.tagName=='BUTTON'){
			var newval=e.target.dataset.id;
			var oldval=current.textContent;
			if(remain[newval]==0||isDuplicates(current,newval)&&btnBlock.dataset.inverse==1)
				return;
			current.innerHTML=newval+template;
			if(!checkCorrect(current)&&btnShowI.dataset.inverse==1)
				current.classList.add('incorrect')
			else
				current.classList.remove('incorrect')
			current.classList.remove('blank');
			current.classList.add('mutable');
			syncData(current,newval,oldval);
			if(!document.querySelector('.blank')){
				if(checkSuccess()){
					showDialog();
				}
			}
		}
	}
	btnErase.onclick=function(){
		if(!current){
			inverse(this,'erase');
			return;
		}
		if(!current.classList.contains('fixed')){
			var oldval=current.textContent;
			current.innerHTML=template;
			current.classList.remove('incorrect')
			current.classList.remove('mutable');
			current.classList.add('blank');
			syncData(current,0,oldval);
			removeFocusAndMask()
			current=null;
			hideGuides();
		}
	}
	btnNotes.onclick=function(){
		inverse(this,'notes');
		if(this.dataset.inverse=='1')
			btns.classList.add('show-note');
		else
			btns.classList.remove('show-note');
		
	}
	btnHint.onclick=function(){
		if(!current)
			return;
		var bid=Number(current.parentNode.dataset.bid);
		var cid=Number(current.dataset.cid);
		var newval=data_a[bid][cid];
		var oldval=current.textContent;
		if(newval!=oldval&&this.dataset.count!=0){
			current.innerHTML=newval+template;
			current.classList.remove('incorrect')
			current.classList.remove('blank')
			current.classList.add('mutable')
			this.dataset.count=Number(this.dataset.count)-1;
			this.innerHTML=`&times;${this.dataset.count}`
			syncData(current,newval,oldval);
		}
		
	}
	btnShowI.onclick=function(){
		inverse(this,'incorrect');
		var m=document.getElementsByClassName('mutable');
		if(this.dataset.inverse==1){
			[...m].forEach(function(item){
				if(!checkCorrect(item))
					item.classList.add('incorrect')
			})
		}else{
			[...m].forEach(function(item){
				item.classList.remove('incorrect')
			})
		}
	}
	btnBlock.onclick=function(){
		inverse(this,'block');
	}
	btnShowG.onclick=function(){
		inverse(this,'guides');
		if(!current)
			return;
		if(this.dataset.inverse==1)
			showGuides(current);
		else
			hideGuides();
	}
	btnHelp.onclick=function(){
		var cover=document.querySelector('.cover')
		cover.style.display="flex";
		clearInterval(timer);
	}
	document.querySelector('.close').onclick=function(){
		var cover=document.querySelector('.cover')
		cover.style.display="none";
		timer=setInterval(calcTime,1000)
	}
	btnPause.onclick=function(){
		var pauseBg=document.querySelector('.pause-bg');
		pauseBg.style.display='flex';
		clearInterval(timer);	
	}
	btnBack.onclick=function(){
		var title=document.querySelector('.dialog .title');
		var header=document.querySelector('.dialog .content h2');
		var container=document.querySelector('.container');
		container.style.display="flex";
		title.innerHTML='Exit Game';
		header.innerHTML='Exit Game';
		action='back';
		clearInterval(timer);
	}
	document.querySelector('.resume').onclick=function(){
		var pauseBg=document.querySelector('.pause-bg')
		pauseBg.style.display="none";
		timer=setInterval(calcTime,1000)
	}
	btnNewGame.onclick=function(){
		var title=document.querySelector('.dialog .title');
		var header=document.querySelector('.dialog .content h2');
		var container=document.querySelector('.container');
		container.style.display="flex";
		title.innerHTML='New Game';
		header.innerHTML='New Game';
		action="newgame"
		clearInterval(timer);
	}
	btnRestart.onclick=function(){
		var title=document.querySelector('.dialog .title');
		var header=document.querySelector('.dialog .content h2');
		var container=document.querySelector('.container');
		container.style.display="flex";
		title.innerHTML='Restart Game';
		header.innerHTML='Restart Game';
		action='restart';
		clearInterval(timer);
	}
	document.querySelector('.yes').onclick=function(){
		var container=document.querySelector('.container');
		container.style.display="none";
		if(action=='newgame')
			newGame();
		else if(action=='restart')
			init(panel);
		else
			window.location='index.html';
	}
	document.querySelector('.no').onclick=function(){
		var container=document.querySelector('.container');
		container.style.display="none";
		timer=setInterval(calcTime,1000)
	}
	function newGame(){
		progress=(progress+1)%length;
		window.localStorage.setItem(level,progress);
		init(panel,progress)
	}
	function showGuides(current){
		var bid=Number(current.parentNode.dataset.bid);
		var cid=Number(current.dataset.cid)
		var set=new Set();
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if(i%3==bid%3&&j%3==cid%3||Math.floor(i/3)==Math.floor(bid/3)&&Math.floor(j/3)==Math.floor(cid/3)||i==bid)
					set.add(data_q[i][j])
			}
		}
		var result=[1,2,3,4,5,6,7,8,9].filter(function(item){
			return !set.has(item)
		})
		hideGuides();
		for(var k=0;k<result.length;k++){
			btns.children[result[k]-1].classList.add('tips')
		}
	}
	function hideGuides(){
		for(var k=0;k<btns.children.length;k++){
			btns.children[k].classList.remove('tips')
		}
	}
	function isDuplicates(current,newval){
		var bid=Number(current.parentNode.dataset.bid);
		var cid=Number(current.dataset.cid)
		var set=new Set();
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if(i%3==bid%3&&j%3==cid%3||Math.floor(i/3)==Math.floor(bid/3)&&Math.floor(j/3)==Math.floor(cid/3)||i==bid)
					set.add(data_q[i][j])
			}
		}
		if(set.has(Number(newval)))
			return true;
		else
			return false;
	}
	function checkCorrect(current){
		var bid=Number(current.parentNode.dataset.bid);
		var cid=Number(current.dataset.cid)
		return data_a[bid][cid]==current.textContent;
	}
	function inverse(ele,name){
		if(ele.dataset.inverse==1){
			ele.style.background=`url(img/${name}.png)`
			ele.dataset.inverse=0
		}else{
			ele.style.background=`url(img/${name}-inverse.png)`
			ele.dataset.inverse=1;
		}
	}
	function init(panel,pro){
		panel.innerHTML='';
		remain={1:9,2:9,3:9,4:9,5:9,6:9,7:9,8:9,9:9};
		if(window.location.search.match(/\?level=(\w+)/))
			level=window.location.search.match(/\?level=(\w+)/)[1]
		progress=pro||Number(window.localStorage.getItem(level));
		[data_q,data_a]=getQA(level,progress);
		data_q.forEach(function(bval,bid){
			var block=document.createElement('div');
			block.classList.add('block');
			block.dataset.bid=bid;
			bval.forEach(function(cval,cid){
				if(cval!=0){
					remain[cval]--;
				}
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
				if(cval==0){
					var cross=document.createElement('div');
					cross.classList.add('cross');
					cell.appendChild(cross);
				}
			})
			panel.appendChild(block);
		});
		[...btns.children].forEach(function(item,index){
			item.children[0].textContent=remain[index+1];
		})
		seconds=0;
		timer=setInterval(calcTime,1000)
	}
	function getQA(level,index){
		var q,a;
		var xhr=new XMLHttpRequest();
		xhr.open('GET',`js/${level}.json`,false)
		try{
			xhr.send(null);
		}catch(e){
			console.log(e)
		}
		if(xhr.status!=200){
			console.log('error')
			q=[
				[0,3,0,0,0,2,8,0,0],[0,4,8,9,3,1,0,0,0],[0,6,2,4,0,5,0,7,0],
				[0,2,5,0,0,0,1,0,6],[8,9,0,4,1,0,2,5,3],[0,0,3,5,2,0,7,9,4],
				[2,0,1,0,7,0,6,0,0],[0,8,5,1,0,0,0,7,0],[9,3,0,8,5,6,2,4,1]
			]
		}else{
			length=JSON.parse(xhr.responseText).length;
			q=JSON.parse(xhr.responseText)[index];
		}
		xhr.open('GET',`js/${level}-a.json`,false)
		try{
			xhr.send(null);
		}catch(e){
			console.log(e)
		}
		if(xhr.status!=200){
			console.log('error')
			a=[
				[5,3,9,7,6,2,8,1,4],[7,4,8,9,3,1,5,6,2],[1,6,2,4,8,5,3,7,9],
				[4,2,5,3,9,7,1,8,6],[8,9,7,4,1,6,2,5,3],[6,1,3,5,2,8,7,9,4],
				[2,4,1,9,7,3,6,5,8],[6,8,5,1,2,4,3,7,9],[9,3,7,8,5,6,2,4,1]
			]
		}else{
			length=JSON.parse(xhr.responseText).length;
			a=JSON.parse(xhr.responseText)[index];
		}
		return [q,a];
	}
	function calcTime(){
		seconds++;
		var hour=Math.floor(seconds/3600).toString().padStart(2,'0');
		var minute=Math.floor(seconds%3600/60).toString().padStart(2,'0');
		var second=Math.floor(seconds%3600%60).toString().padStart(2,'0')
		var time=document.querySelector('.time');
		time.innerHTML=`${hour}:${minute}:${second}`
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
	function removeFocusAndMask(){
		var focused=document.getElementsByClassName('focus');
		[...focused].forEach(function(item){
			item.classList.remove('focus')
		});
		var masked=document.getElementsByClassName('masked');
		[...masked].forEach(function(item){
			item.classList.remove('masked')
		});
	}
	function getCell(current,dir){
		var bid=Number(current.parentNode.dataset.bid);
		var cid=Number(current.dataset.cid);
		if(dir=="top"){
			if(cid<3&&bid<3){
				bid=bid+6;
				cid=cid+6;
			}else if(cid<3&&bid>=3){
				bid=bid-3;
				cid=cid+6;
			}else{
				cid=cid-3;
			}
		}else if(dir=='bottom'){
			if(cid<6){
				cid=cid+3;
			}else if(cid>=6&&bid<6){
				cid=cid-6;
				bid=bid+3;
			}else{
				cid=cid-6;
				bid=bid-6;
			}
		}else if(dir=='left'){
			if(cid%3>0){
				cid=cid-1;
			}else if(cid%3==0&&bid%3>0){
				bid=bid-1;
				cid=cid+2;
			}else{
				bid=bid+2;
				cid=cid+2;
			}
		}else{
			if(cid%3<2){
				cid=cid+1;
			}else if(cid%3==2&&bid%3<2){
				bid=bid+1;
				cid=cid-2;
			}else{
				bid=bid-2;
				cid=cid-2;
			}
		}
		return panel.children[bid].children[cid];
	}
	function syncData(current,newval,oldval){
		var bid=current.parentNode.dataset.bid;
		var cid=current.dataset.cid;
		data_q[bid][cid]=Number(newval);
		if(newval!=0){
			remain[newval]--;
		}
		if(oldval!=0){
			remain[oldval]++;
		}
		[...btns.children].forEach(function(item,index){
			item.children[0].textContent=remain[index+1];
		})
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
		var title=document.querySelector('.dialog .title');
		var header=document.querySelector('.dialog .content h2');
		var question=document.querySelector('.dialog .question');
		var container=document.querySelector('.container');
		container.style.display="flex";
		title.innerHTML='Congratulation';
		header.innerHTML='Congratulation';
		question.innerHTML='Game complete successfully,do you want to continue?'
		clearInterval(timer);
	}

}