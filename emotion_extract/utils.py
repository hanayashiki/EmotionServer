from django.shortcuts import HttpResponse
import json

class GetRequestException(Exception):
    def __init__(self, what):
        self.what = what

def returnJSON(dict):
    return HttpResponse(json.dumps(dict), content_type='application/json')

