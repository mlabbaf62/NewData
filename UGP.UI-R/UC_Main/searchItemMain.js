function findItemMenu(e) {
    var itemBoxspan = $(".itemBoxMainPage a span");
    var itemBox = $(".itemBoxMainPage");
    var elements = new Array();
    elements = document.getElementsByClassName("itemBoxMainPage");

    console.log(e)
    try {
        if (e.length < 3) { //show all
            for (i in elements) {
                var str = itemBoxspan[i].innerText; // "استعلام صدور پروانه.";
                var n = str.indexOf(e);
                elements[i].style.display = "block";
            }
            return
        }

        for (i in elements) {
            var str = itemBoxspan[i].innerText; // "استعلام صدور پروانه.";
            var n = str.indexOf(e);
            if (n != -1)
                elements[i].style.display = "block";
            else
                elements[i].style.display = "none";

        }
    } catch (ex) {
        console.log(ex)
    }

    // for (i = 0; i < itemBoxspan.length; i++) {
    //     var str = itemBoxspan[i].innerText; // "استعلام صدور پروانه.";
    //     var n = str.indexOf(e);
    //     if (n != -1)
    //         $(itemBox)[i].show();
    //     else
    //         $(itemBox)[i].hide();
    // }
    // itemBoxspan.forEach(function(item, index) {
    //     var str = item.innerText; // "استعلام صدور پروانه.";
    //     var n = str.indexOf(e);
    //     if (n != -1)
    //         $(itemBox)[index].show();
    //     else
    //         $(itemBox)[index].hide();
    // })

}

//var baseUrl = "http://192.168.100.191/UGP-Isf2/desk.html";

