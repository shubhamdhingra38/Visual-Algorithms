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
from .views import *


urlpatterns = [
    path('', home, name='home'),
    path('traversal/', traversal, name='traversal'),
    path('bfsdfs/', bfsdfs, name='bfsdfs'),
    path('sorting/', sorting, name='sorting'),
    path('quicksort', quick_sort, name='quick_sort'),
    path('convhull/', conv_hull, name='convex_hull'),
    path('dijkstra/', dijkstra, name='dijkstra'),
    path('convolution/', convolution, name='convolution'),
    path('convolution/process', convolution_process, name='conv_process'),
    path('prims/', prims, name='prims_mst'),
    path('valueiter', value_iteration, name='value_iteration'),
    path('genetic', genetic_algorithm, name='genetic_algorithm'),
    path('tsp', travelling_salesperson, name='tsp'),
    path('linregression', linear_regression, name='lin_reg'),
    path('astar', a_star, name='a_star')
]
