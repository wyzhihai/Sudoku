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
	Vue.component('block',{
		props:{
			block:{
				type:Array
			}
		},
		template:`<div class="block">
					<cell v-for="cell in block" :cell="cell"></cell>
				</div>`,
	})
	Vue.component('cell',{
		props:{
			cell:{
				type:Number
			}
		},
		template:`<div @keyup="key" class="cell" :class="{blank:cell==0}">
					<span v-if="cell!=0">{{cell}}</span>
				</div>`,
		methods:{
			key:function(e){
				console.log(e)
			}
		}

	})
	var vm=new Vue({
		el:'.panel',
		data:{
			data_q,
			data_a
		}
	})
}