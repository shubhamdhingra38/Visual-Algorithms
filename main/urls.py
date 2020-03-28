"""visualization URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import home, bfs, bfs_info, bfs_visual

urlpatterns = [
    path('', home, name='home'),
    path('bfs/', bfs, name='bfs'),
    path('bfs/info/', bfs_info, name='bfs_info'),
    path('bfs/visual/', bfs_visual, name='bfs_visual')
]
