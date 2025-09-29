from django.db import models
from django.contrib.auth.models import AbstractUser
# ENUM choices
ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('staff', 'Staff'),
    ('client', 'Client'),
]

STATUS_CHOICES = [
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('suspended', 'Suspended'),
]

PAYMENT_TYPE_CHOICES = [
    (1, 'Cash'),
    (2, 'Card'),
    (3, 'Online'),
]

PAYMENT_STATUS_CHOICES = [
    (0, 'Pending'),
    (1, 'Paid'),
    (2, 'Failed'),
]

ORDER_STATUS_CHOICES = [
    (0, 'Draft'),
    (1, 'Confirmed'),
    (2, 'Shipped'),
    (3, 'Completed'),
]

class Brand(models.Model):
    brand_id = models.AutoField(primary_key=True)
    brand_name = models.CharField(max_length=255)
    brand_active = models.BooleanField(default=False)
    brand_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'brands'
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'

    def __str__(self):
        return self.brand_name

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=255)
    category_active = models.BooleanField(default=False)
    category_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.category_name


class User(AbstractUser):
    name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    avatar = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username
    
    
class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    product_image = models.CharField(max_length=255, blank=True, null=True)
    brand = models.ForeignKey(Brand, on_delete=models.RESTRICT, db_column='brand_id')
    category = models.ForeignKey(Category, on_delete=models.RESTRICT, db_column='category_id')
    quantity = models.IntegerField()
    min_stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, blank=True, null=True)
    store = models.CharField(max_length=255, blank=True, null=True)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    active = models.BooleanField(default=False)
    status = models.BooleanField(default=False)

    class Meta:
        db_table = 'product'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return self.product_name

class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    order_date = models.DateField()
    client_name = models.CharField(max_length=255)
    client_contact = models.CharField(max_length=255)
    sub_total = models.DecimalField(max_digits=12, decimal_places=2)
    vat = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    paid = models.DecimalField(max_digits=12, decimal_places=2)
    due = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.IntegerField(choices=PAYMENT_TYPE_CHOICES)
    payment_status = models.IntegerField(choices=PAYMENT_STATUS_CHOICES)
    payment_place = models.IntegerField()
    gstn = models.CharField(max_length=255, blank=True, null=True)
    order_status = models.IntegerField(choices=ORDER_STATUS_CHOICES, default=0)
    tag = models.CharField(max_length=50, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.RESTRICT, db_column='user_id')

    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f"Order #{self.order_id}"

class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column='order_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.IntegerField()
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    order_item_status = models.BooleanField(default=False)

    class Meta:
        db_table = 'order_item'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"Order Item #{self.order_item_id}"

class OnHandItem(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    min_balance = models.IntegerField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'onHandItems'
        verbose_name = 'On Hand Item'
        verbose_name_plural = 'On Hand Items'

    def __str__(self):
        return self.name if self.name else f"OnHandItem #{self.id}"

class Transaction(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='user_id', blank=True, null=True)
    action_type = models.CharField(max_length=32)
    entity_type = models.CharField(max_length=32)
    entity_id = models.CharField(max_length=64, blank=True, null=True)
    data_before = models.JSONField(blank=True, null=True)
    data_after = models.JSONField(blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'

    def __str__(self):
        return f"Transaction #{self.id} - {self.action_type}"

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    assigned_to = models.CharField(max_length=255, blank=True, null=True)
    priority = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return self.description if self.description else f"Task #{self.id}"

class Issue(models.Model):
    id = models.AutoField(primary_key=True)
    item = models.CharField(max_length=50, blank=True, null=True)
    reported_by = models.CharField(max_length=255, blank=True, null=True)
    issue = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'issues'
        verbose_name = 'Issue'
        verbose_name_plural = 'Issues'

    def __str__(self):
        return f"Issue #{self.id}"

class LegacyIssue(models.Model):
    issue_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.RESTRICT, db_column='order_id')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, db_column='product_id')
    quantity = models.IntegerField()
    reason = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'legacy_issues'
        verbose_name = 'Legacy Issue'
        verbose_name_plural = 'Legacy Issues'

    def __str__(self):
        return f"Legacy Issue #{self.issue_id}"