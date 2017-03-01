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

   $(".saveMovie").click( (e) => {
    var target = e.target;
    var id = $(target).data('id');
    var tr = $('.item-id-'+ id);
    console.log(id);
    $.ajax({
        type:"GET",
        url:"/admin/movie/state?id=" + id
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

  $(".selectPjt").click( e => {
    $('.dropdown-toggle').html( $(e.target).text() + "<span class='caret'></span>");
    var target = e.target;
    var id = $(target).data('id');
    console.log(typeof(id));
    console.log((id));

    var tr = $('.item-id-'+ id); 
    $.ajax({
      type:"GET",
      url:"/admin/spider?id=" + id
    })
    .done((results)=>{
      if( results.success === 1){
        $('#inputTitle').val(results.title);
        $('#inputUrl').val(results.url);
        $('#inputBase').val(results.baseUrl);
        $('#inputListC').val(results.listContainer);
        $('#inputList').val(results.listTag);
        $('#inputNumber').val(results.maxNumber);
      }
    })
  })

  $(".addPjt").click( e => {
    console.log($(e.target).text());
    $('.dropdown-toggle').html( $(e.target).text() + "<span class='caret'></span>");

    $('#inputTitle').val('');
    $('#inputUrl').val('');
    $('#inputBase').val('');
    $('#inputListC').val('');
    $('#inputList').val('');
    $('#inputNumber').val('');

  })

})