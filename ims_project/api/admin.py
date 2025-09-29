from django.contrib import admin
from .models import (
	Brand, Category, User, Product, Order, OrderItem, OnHandItem,
	Transaction, Task, Issue, LegacyIssue
)

admin.site.register(Brand)
admin.site.register(Category)
admin.site.register(User)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(OnHandItem)
admin.site.register(Transaction)
admin.site.register(Task)
admin.site.register(Issue)
admin.site.register(LegacyIssue)
