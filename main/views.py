from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from colorama import Fore, Back 
import json
from collections import defaultdict
green = Fore.GREEN

class Graph:
    def __init__(self, n_vertices):
        self.n_vertices = n_vertices
        self.mat = defaultdict(list)
        
    def create_graph(self, values):
        for i in range(self.n_vertices):
            for j in range(self.n_vertices):
                if values[i][j] == 1:
                    self.add_node(i, j)
        
    def add_node(self, u, v):
        self.mat[u].append(v)

    def bfs(self, src):
        queue = [src]
        while len(queue) != 0:
            node = queue.pop(0)
            print(green, node, "->", end=' ')
            neighbors = self.mat[node]
            # print(neighbors)
            queue.extend(neighbors)
        print("Done.")
            
    def dfs(self):
        pass
    
def home(request):
    if request.method == 'POST':
        n_vertices = request.POST['n_vertices']
        n_vertices = int(n_vertices)
        request.session['bfs_info'] = n_vertices
        return HttpResponseRedirect(reverse('bfs'))
    return render(request, 'main/index.htm')


def bfs_info(request):
    if request.method == 'POST':
        values = json.loads(request.POST['values'])
        g = Graph(n_vertices=len(values))
        g.create_graph(values)
        g.bfs(0)
        result = sum([sum(v) for v in values])
        response = JsonResponse({'result': result})
        return response
    

def bfs_visual(request):
    return render(request, 'main/bfsviz.htm')


def bfs(request):
    n_vertices = request.session['bfs_info']
    if request.method == 'POST':
        JsonResponse({'n_vertices': n_vertices, 'text': 'some blah blah'})
    return render(request, 'main/adjmat.htm', context={'n_vertices':n_vertices, 'range':range(n_vertices)})