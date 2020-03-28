function bfs(){
    var data = $("#bfs_form").serializeArray().slice(1);
    var n_vertices = Math.sqrt(data.length);
    var mat = [];
    var ele;
    for(var i=0; i<n_vertices; ++i){
        var row = [];
        for(var j=0; j<n_vertices; ++j){
            ele = parseInt(data[n_vertices*i + j].value);
            if(Number.isNaN(ele)) //fill with 0
                ele = 0;
            row.push(ele);
        }
        mat.push(row);
    }
    return mat;
}
$("document").ready(function(){
    $("#bfs_form").submit(function(event){
        event.preventDefault();
        var data = bfs();
        $.ajax({
            type:'POST',
            url:'/home/bfs/info/',
            data:{
                values: JSON.stringify(data),
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success:function(data){
                var result = data["result"];
                $("#result").text(result);
            }
        });
    });
});