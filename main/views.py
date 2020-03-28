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
        self.visited = [False] * n_vertices
        
    def create_graph(self, values):
        for i in range(self.n_vertices):
            for j in range(self.n_vertices):
                if values[i][j] == 1:
                    self.add_node(i, j)
        
    def add_node(self, u, v):
        self.mat[u].append(v)
        
    def debug_mat(self):
        print(self.mat)

    def bfs(self, src):
        result = []
        complete_bfs = []
        queue = [src]
        while len(queue) != 0:
            node = queue.pop(0)
            if not self.visited[node]:
                self.visited[node] = True
                print(green, node, "->", end=' ')
                result.append(node)
                neighbors = self.mat[node]
                if len(neighbors) != 0:
                    l = []
                    for nbr in neighbors:
                        if not self.visited[nbr]:
                            l.append(nbr)
                    if l != []:
                        complete_bfs.append([node, l])
                queue.extend(neighbors)
        return (result, complete_bfs)
            
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
        adj_mat = values['mat']
        src = int(values['src'])
        g = Graph(n_vertices=len(adj_mat))
        g.create_graph(adj_mat)
        result, complete_bfs = g.bfs(src-1)
        print(green, complete_bfs)
        # g.debug_mat()
        response = JsonResponse({'result': complete_bfs})
        return response


def bfs_visual(request):
    return render(request, 'main/bfsviz.htm')


def bfs(request):
    n_vertices = request.session['bfs_info']
    if request.method == 'POST':
        JsonResponse({'n_vertices': n_vertices, 'text': 'some blah blah'})
    return render(request, 'main/adjmat.htm', context={'n_vertices':n_vertices, 'range':range(n_vertices)})