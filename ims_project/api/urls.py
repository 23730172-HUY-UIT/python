from django.urls import path
from .views import LoginView, LogoutView
from rest_framework import routers
from .views import ProductViewSet, OrderViewSet, CategoryViewSet, IssueViewSet, TransactionViewSet, BrandViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'brands', BrandViewSet)

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='api-login'),
    path('api/logout/', LogoutView.as_view(), name='api-logout'),
] + router.urls
