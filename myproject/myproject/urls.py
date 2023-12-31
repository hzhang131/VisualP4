"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.contrib import admin
from django.urls import path
from myapp import views

urlpatterns = [
    path("", views.index, name="index"),
    path("VisualP4_logo.png", views.p4logo, name="p4logo"),
    path("onboarding.pdf", views.onboarding, name="onboarding"),
    path("HPD/", views.header_metadata_pagefile, name="headers_page"),
    path("APD/", views.action_metadata_pagefile, name="actions_page"),
]
