$("document").ready(function(){
    var type = $("p").text();
    $("#reset-btn").on("click", function(){
        resetSketch();
    });
    $("#submit-btn").on("click", function(){
        var src = $("#source").val();
        var mat = getAdjMat();
        $.ajax({
            type: 'POST',
            url: '/home/traversal/',
            data: {
                values: JSON.stringify({
                    'type': type,
                    'src': src,
                    'mat': mat
                }),
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success:function(data){
                var result = data["result"];
                if(type == 'bfs')
                    initBFS(result);
                else
                    initDFS(result);
            }

        })
    })
});