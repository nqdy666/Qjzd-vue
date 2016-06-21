<template>
    <nav class="navbar navbar-default">
        <div class="container">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a href="#"><img alt height="50px" src="https://qjzd.net/public/images/qjzd-logo.png"/></a>
            </div>

            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li class="active"><a href="#">全部</a></li>
                    <li><a href="#">精华</a></li>
                    <li><a href="#">分享</a></li>
                    <li><a href="#">问答</a></li>
                    <li><a href="#">码农</a></li>
                    <li><a href="#">摄影</a></li>
                    <li><a href="#">单车</a></li>
                    <li><a href="#">爱情</a></li>
                    <li><a href="#">聊聊</a></li>
                </ul>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="#">Login</a></li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
    import utils from '../libs/utils'       //加载公用函数

    export default {
        replace:true,
        props: ['pageType','fixHead','showMenu','messageCount','needAdd'],
        data (){
            return {
                nickname: '',
                profileimgurl: ''
            }
        },
        methods: {
            openMenu (){
                $("html, body, #page").addClass("scroll-hide");
                this.showMenu=!this.showMenu;
            },
            showMenus (){
                this.showMenu=!this.showMenu;
                $("html, body, #page").removeClass("scroll-hide");
            }
        },
        components:{
            'nvMenu':require('./menu.vue')
        }
    }
</script>
