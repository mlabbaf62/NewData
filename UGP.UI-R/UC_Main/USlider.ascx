﻿<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="USlider.ascx.cs" Inherits="UGP.UI.UC_Main.USlider" %>


<style>
    .mySlides {
        display: none;
    }

        .mySlides img {
            vertical-align: middle;
            width: 100%;
        }

    /* Slideshow container */
    .slideshow-container {
        position: relative;
        margin: auto;
    }




    /* Fading animation */
    .fade {
        -webkit-animation-name: fade;
        -webkit-animation-duration: 2s;
        animation-name: fade;
        animation-duration: 2s;
    }

    @-webkit-keyframes fade {
        from {
            opacity: .4;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes fade {
        from {
            opacity: .4;
        }

        to {
            opacity: 1;
        }
    }

    .dotU {
        height: 10px;
        width: 10px;
        margin: 0 2px;
        background-color: #bbb;
        border-radius: 50%;
        display: inline-block;
        transition: background-color 0.6s ease;
    }

        .dotU.active {
            background-color: #717171;
        }
</style>



<div class="slideshow-container hidden-xs " ng-app="App" ng-controller="CtlMenu">

    <div class="mySlides" ng-repeat="m in SliderImages">
        <img ng-src="Config/SlideImages/{{m}}">
    </div>

    <div style="text-align: center; position: absolute; bottom: 2px; text-align: center; left: 50%">
        <span class="dotU" ng-repeat="m in SliderImages"></span>
    </div>


</div>
<script>
    var slideIndex = 0;
    //showSlides();

    function StartSlide() {
        showSlides();

        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        timer = setInterval(showSlides, SliderTimer);
    }

    function showSlides() {
        var i;

        var slides = document.getElementsByClassName("mySlides");
        var dots = document.getElementsByClassName("dotU");
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1 }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        $(slides[slideIndex - 1]).fadeIn(1000);
        dots[slideIndex - 1].className += " active";

        // setTimeout(showSlides,2000); // Change image every 2 seconds
    }

    function setSlidesEvent() {
        $('.dotU').click(function (e) {
            slideIndex = $(e.currentTarget).index();
            StartSlide();
        });
    }

</script>

<script>
    var App = angular.module('App', []);

    App.controller('CtlMenu', function ($scope, $http) {
        $scope.GetSliderImages = function () {
   
            $http.post('Default.aspx/GetSliderImages', { data: {} })
             .success(function (data, status, headers, config) {
                 $scope.SliderImages = data.d.SliderImages;
                 $scope.$apply();

                 StartSlide();
                 setSlidesEvent();

            
             })
                .error(function (data, status, headers, config) {
                    StopBusy('myCarousel');
                    $scope.status = status;
                });
        }

        $scope.GetSliderImages();
    });
</script>
