from django.contrib import admin
from .models import *
# Register your models here.

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
