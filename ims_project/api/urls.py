from django.urls import path
from .views import LoginView, LogoutView, get_csrf
from rest_framework import routers
from .views import ProductViewSet, OrderViewSet, CategoryViewSet, IssueViewSet, TransactionViewSet, BrandViewSet, UserViewSet, OnHandItemViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'users', UserViewSet)
router.register(r'onhanditems', OnHandItemViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('csrf/', get_csrf, name='api-csrf'),
] + router.urls
