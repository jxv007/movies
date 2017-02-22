$(function(){
  $(".delMovie").click( (e) => {
    var target = e.target;
    var id = $(target).data('id');
    var tr = $('.item-id-'+ id); 
    $.ajax({
      type:"DELETE",
      url:"/admin/movie/list?id=" + id
    })
    .done((results)=>{
      if( results.success === 1 && tr.length > 0){
        tr.remove();
      }
    })
  });

  $(".delCategory").click( (e) => {
    var target = e.target;
    var id = $(target).data('id');
    var tr = $('.item-id-'+ id); 
    console.log('delCategory: ' + id);
    $.ajax({
      type:"DELETE",
      url:"/admin/category/list?id="+id
    })
    .done((results)=>{
      if(results.success === 1){
        if(tr.length > 0){
          tr.remove();
        }
      }
    })
  });
})