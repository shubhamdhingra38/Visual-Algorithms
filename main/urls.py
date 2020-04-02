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
from .views import home, adj_matrix, traversal, bfs_visual, dfs_visual, sorting

urlpatterns = [
    path('', home, name='home'),
    path('input/', adj_matrix, name='adj_matrix'),
    path('traversal/', traversal, name='traversal'),
    path('dfs/visual/', dfs_visual, name='dfs_visual'),
    path('bfs/visual/', bfs_visual, name='bfs_visual'),
    path('sorting/', sorting, name='sorting')
]
