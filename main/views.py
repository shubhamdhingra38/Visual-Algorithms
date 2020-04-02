from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from colorama import Fore, Back
import json
from collections import defaultdict

DEBUG = True
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
        result = []
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
                        result.append([node, l])
                queue.extend(neighbors)
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


def home(request):
    if request.method == 'POST':
        n_vertices = request.POST['n_vertices']
        n_vertices = int(n_vertices)
        request.session['n_vertices'] = n_vertices
        return HttpResponseRedirect(reverse('adj_matrix'))
    return render(request, 'main/home.htm')


def traversal(request):
    if request.method == 'POST':
        values = json.loads(request.POST['values'])
        type_ = values['type']
        adj_mat = values['mat']
        src = int(values['src'])
        g = Graph(n_vertices=len(adj_mat))
        # print(GREEN, adj_mat)
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


def sorting(request):
    return render(request, 'main/sorting.htm')


def bfs_visual(request):
    return render(request, 'main/bfsviz.htm')


def dfs_visual(request):
    return render(request, 'main/dfsviz.htm')


def adj_matrix(request):
    n_vertices = request.session['n_vertices']
    return render(request, 'main/adjmat.htm', context={
        'n_vertices': n_vertices,
        'range': range(n_vertices)
    })
