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

  $(".delSpider").click( (e) => {
    var target = e.target;
    var id = $(target).data('id');
    var tr = $('.item-id-'+ id); 
    $.ajax({
      type:"DELETE",
      url:"/admin/spider/list?id="+id
    })
    .done((results)=>{
      if(results.success === 1){
        if(tr.length > 0){
          tr.remove();
        }
      }
    })
  });

  $('#btn-douban').click(function(){
    var douban = $('#douban');
    var id = douban.val();
    if (id) {
      $.ajax({
        url: 'https://api.douban.com/v2/movie/subject/' + id,
        cache: true,
        type: 'get',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'callback',
        success: function(data){
          $('#inputTitle').val(data.title)
          $('#inputDirector').val(data.directors[0].name)
          $('#inputCountry').val(data.countries[0])
          $('#inputPoster').val(data.images.large)
          $('#inputYear').val(data.year)
          $('#inputDescription').val(data.summary)
          console.log(data)
        }
      });
    }
  });
});
