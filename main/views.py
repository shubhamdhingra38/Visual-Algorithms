from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.core.files.storage import FileSystemStorage
from colorama import Fore, Back
import json
from collections import defaultdict
import os

DEBUG = False
GREEN = Fore.GREEN


class Graph:
    def __init__(self, n_vertices):
        self.n_vertices = n_vertices
        self.mat = defaultdict(list)
        self.visited = [False] * n_vertices
        self.dfs_res = []

    def create_graph(self, values):
        for i in range(self.n_vertices):
            for j in range(self.n_vertices):
                if values[i][j] == 1:
                    self.add_node(i, j)

    def add_node(self, u, v):
        self.mat[u].append(v)

    def bfs(self, src):
        result = [src]
        queue = [src]
        while len(queue) != 0:
            node = queue.pop(0)
            if not self.visited[node]:
                self.visited[node] = True
                if DEBUG:
                    print(GREEN, node, "->", end=' ')
                neighbors = self.mat[node]
                if len(neighbors) != 0:
                    l = []
                    for nbr in neighbors:
                        if not self.visited[nbr]:
                            l.append(nbr)
                    if l != []:
                        result.extend(l)
                queue.extend(neighbors)
        result.extend(l)
        return result

    def dfs_utility(self, node):
        if node == None:
            return
        self.visited[node] = True
        self.dfs_res.append(node)
        neighbors = self.mat[node]
        for nbr in neighbors:
            if not self.visited[nbr]:
                self.dfs_utility(nbr)

    def dfs(self, src):
        self.dfs_utility(src)
        return self.dfs_res

def traversal(request):
    if request.method == 'POST':
        values = json.loads(request.POST['values'])
        type_ = values['type']
        adj_mat = values['mat']
        src = int(values['src'])
        g = Graph(n_vertices=len(adj_mat))
        g.create_graph(adj_mat)
        if type_.lower() == 'bfs':
            result = g.bfs(src-1)
        else:
            result = g.dfs(src-1)
        if DEBUG:
            print(GREEN, result)
        response = JsonResponse({
            'result': result
        })
        return response


def home(request):
    if request.method == 'POST':
        n_vertices = request.POST['n_vertices']
        n_vertices = int(n_vertices)
        request.session['n_vertices'] = n_vertices
    return render(request, 'main/home.htm')


def sorting(request):
    return render(request, 'main/sorting.htm')

def quick_sort(request):
    return render(request, 'main/quicksort.htm')

def bfsdfs(request):
    return render(request, 'main/bfsdfs.htm')


def conv_hull(request):
    return render(request, 'main/conv_hull.htm')

def dijkstra(request):
    return render(request, 'main/dijkstra.htm')

def prims(request):
    return render(request, 'main/prims.htm')


def value_iteration(request):
    return render(request, 'main/value_iter.htm')

def genetic_algorithm(request):
    return render(request, 'main/genetic_algo.htm')

def travelling_salesperson(request):
    return render(request, 'main/tsp.htm')

def linear_regression(request):
    return render(request, 'main/linreg.htm')

def a_star(request):
    return render(request, 'main/astar.htm')

#apply filters on the image
def convolution_process(request):
    img_name = request.session['img_name']
    return render(request, 'main/convprocess.htm',
     context = {
        'img': img_name,
        'range': range(3),
     })


#get the image
def convolution(request):
    if request.method == 'POST':
        img_file = request.FILES['img-upload']
        fs = FileSystemStorage(location='./data/')
        fs.save(img_file.name, img_file)
        request.session['img_name'] = img_file.name
        return HttpResponseRedirect(reverse('conv_process'))
    else:
        return render(request, 'main/convolution.htm')