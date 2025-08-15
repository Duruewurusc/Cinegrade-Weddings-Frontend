from django.db import models
from django.contrib.auth.models import User, AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.db.models import Max

from django.db.models.signals import post_save
from django.dispatch import receiver



class Client(AbstractUser):
    # client_name = models.CharField(max_length=100, blank=True)
    event_role = models.CharField(max_length=10, choices=[('Groom','Groom'),('Bride','Bride'),
    ('Relation','Relation'),('Planner','Planner')], blank=True)
    address= models.CharField(max_length=100, blank=True)
    instagram_handle = models.CharField(max_length=100, blank=True)
    phone = PhoneNumberField(region='NG', blank=True) 
    trad_anniversary = models.DateField(blank= True, null=True)
    wedding_anniversary = models.DateField(blank=True, null=True)
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = PhoneNumberField(region='NG', blank=True) 
    spouse_email = models.EmailField( blank=True)
    spouse_instagram = models.CharField(max_length=100 , blank=True)
    
    def __str__(self):
        return self.username or "Unnamed User"
    
    @property
    def client_name(self):
        return f"{self.last_name} {self.first_name}"



class Package(models.Model):
    package_name = models.CharField(max_length=100)
    category = models.CharField(max_length=10, choices=[('photo','photo'),('video','video'),('combo','combo'),('custom','custom')], default='combo')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    deliverables = models.TextField(help_text="List of deliverables, separated by commas")
    duration = models.CharField(max_length=50, help_text="E.g., '8 hours coverage'", blank=True)
    is_popular = models.BooleanField(default=False)
    image = models.ImageField(upload_to='package_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f"{self.package_name} (+N{self.price})"

    def deliverables_list(self):
        return [d.strip() for d in self.deliverables.split(',')]
    
    class Meta:
        ordering = ['price']
        verbose_name = 'Wedding Package'
        verbose_name_plural = 'Wedding Packages'

class PackageAddOn(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10,decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (+N{self.price})"

  
    
    
class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='booker', default="")
    wedding_date = models.DateField()
    location = models.CharField(max_length=255)
    packages = models.ManyToManyField(Package, related_name='bookings')
    Addons = models.ManyToManyField(PackageAddOn, related_name='bookings', blank=True)
    booking_status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    date_booked = models.DateTimeField(auto_now_add=True)
    booking_code = models.CharField(max_length=12, unique=True, editable=False, blank=True)

    delivery_status = models.CharField(max_length=50,choices=[('Not Started', 'Not Started'),
            ('In Progress', 'In Progress'),
            ('Ready', 'Ready'),
            ('Delivered', 'Delivered'),
        ],
        default='Not Started'
    )
    Image_link = models.URLField(blank=True, null=True)
    Video_link = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def invoice_number(self):
        return self.invoice.invoice_number if self.invoice else None

    @property
    def invoice_total(self):
        """Returns the total amount from the associated invoice if it exists"""
        if hasattr(self, 'invoice'):
            return self.invoice.total_amount
        return Decimal('0.00')

    def save(self, *args, **kwargs):
        # groom= Client.objects.get(id=self.client.id)
        # bookings = groom.booker.all()
        # print(bookings[1].booking_code)
        if not self.booking_code:
            today_str = timezone.now().strftime('%Y%m%d')
            prefix = f"CGWBK-{today_str}"

            # Find the latest booking code starting with today's date
            last_code = self.__class__.objects.filter(
                booking_code__startswith=prefix
            ).aggregate(Max('booking_code'))['booking_code__max']

            if last_code:
                # Extract and increment the numeric part
                last_number = int(last_code.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.booking_code = f"{prefix}-{new_number:04d}"
        super().save(*args, **kwargs)

         # Create an invoice if one doesn't exist
        # if not hasattr(self, 'invoice'):
        invoice, created =Invoice.objects.get_or_create(booking=self)
        invoice.create_invoice_items_from_booking()
            # super().save(*args, **kwargs)
            # Invoice.save()
        # Invoice.create_invoice_items_from_booking()
        
        


    def __str__(self):
        return f"Booking by {self.client.username} on {self.wedding_date}"

class Invoice(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=20, unique=True, blank=True)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True)
    # total = models.DecimalField(max_digits=9, decimal_places=2, null=True, default=50)
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('unpaid', 'Unpaid'),
            ('paid', 'Paid')
        ],
        default='draft'
    )
    
    
    class Meta:
        ordering = ['-issue_date']
    
    @property
    def items(self):
        """Returns all related invoice items, including auto-generated ones."""
        return InvoiceItem.objects.filter(invoice=self)
    
    @property
    def total_amount(self):
        return sum(item.line_total for item in self.invoice_items.all())
    

    def create_invoice_items_from_booking(self):
       

        """Creates invoice items from the booking's packages and addons."""
        # Create items for packages
        self.invoice_items.filter(
        item_type__in=[InvoiceItem.ItemType.PACKAGE, InvoiceItem.ItemType.ADDON]
        ).delete()
        for package in self.booking.packages.all():
            InvoiceItem.objects.get_or_create(
                invoice=self,
                item_type=InvoiceItem.ItemType.PACKAGE,
                package=package,
                defaults={
                    'description': package.package_name,
                    'unit_price': package.price,
                    'quantity': 1,
                    'item_type': InvoiceItem.ItemType.PACKAGE,
                    'is_taxable': False,
                }
            )
        
        # Create items for addons
        for addon in self.booking.Addons.all():
            InvoiceItem.objects.get_or_create(
                invoice=self,
                addon=addon,
                defaults={
                    'description': addon.name,
                    'unit_price': addon.price,
                    'quantity': 1,
                    'item_type': InvoiceItem.ItemType.ADDON,
                    'is_taxable': True,
                }
            )
    
    def save(self, *args, **kwargs):
        """Override save to ensure invoice items are created."""
        if not self.invoice_number:
            self.invoice_number = f"CGINV-{self.booking.booking_code[6:]}"
       
        # Set a default due date if not specified
        if not self.due_date:
            self.due_date = self.issue_date + timezone.timedelta(days=14)

         # First save the invoice to get an ID
        # is_new = self._state.adding
        super().save(*args, **kwargs)
        # if not hasattr(self, 'invoice_items'):

        self.create_invoice_items_from_booking()

        # fields = [f.name for f in self._meta.fields if f.name != 'id']
        # super().save(update_fields=fields)

        # super().save(update_fields=['due_date'])


        # client_book = Booking.objects.get(id=self.booking.id)
        # client_package = client_book.packages.all()
        # print(client_package)
        # for package in client_package:
        #     InvoiceItem.objects.get_or_create(
        #         invoice=self,
        #         item_type=InvoiceItem.ItemType.PACKAGE,
        #         package=package,
        #         # defaults={
        #         #     'description': package.package_name,
        #         #     'unit_price': package.price,
        #         #     'quantity': 1,
        #         #     'item_type': InvoiceItem.ItemType.PACKAGE,
        #         #     'is_taxable': False,
        #         # }
        #     )
        # If this is a new invoice, create items from booking
        # if is_new:  # Only for new invoices
        #     self.create_invoice_items_from_booking()
            # print(self.booking.packages.all())
       
            
        
            

    def __str__(self):
        return f"{self.booking.client.username} - {self.invoice_number}" 


class InvoiceItem(models.Model):
    class ItemType(models.TextChoices):
        PACKAGE = 'package', 'Package'
        ADDON = 'addon', 'Add-On'
        SERVICE = 'service', 'Additional Service'
        DISCOUNT = 'discount', 'Discount'
        OTHER = 'other', 'Other'

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='invoice_items')
    item_type = models.CharField(max_length=20, choices=ItemType.choices, null=True)
    description = models.CharField(max_length=200, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    is_taxable = models.BooleanField(default=True)
    is_discount = models.BooleanField(default=False)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    addon = models.ForeignKey(PackageAddOn, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-id']

    @property
    def line_total(self):
        total = self.quantity * self.unit_price
        return total 
    @property
    def invoice_number(self):
        return self.invoice.invoice_number if self.invoice else None

    def __str__(self):
        return f"{self.description} (x{self.quantity}) @ {self.unit_price}"
    
    def save(self, *args, **kwargs):
        # Automatically set fields from package or addon if not set
        if self.package and not any([self.description, self.unit_price]):
            self.description = self.package.package_name
            self.unit_price = self.package.price
            self.item_type = self.ItemType.PACKAGE
            
        if self.addon and not any([self.description, self.unit_price]):
            self.description = self.addon.name
            self.unit_price = self.addon.price
            self.item_type = self.ItemType.ADDON
            
        super().save(*args, **kwargs)





class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'Cash', 'Cash'
        BANK_TRANSFER = 'Bank Transfer', 'Bank Transfer'
        

    class PaymentStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        COMPLETED = 'Completed', 'Completed'
        FAILED = 'Failed', 'Failed'
        REFUNDED = 'Refunded', 'Refunded'

    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name='payment_transactions')
    amount = models.DecimalField(max_digits=10,decimal_places=2,validators=[MinValueValidator(0.01)])
    payment_date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=50,choices=PaymentMethod.choices,default=PaymentMethod.BANK_TRANSFER)
    status = models.CharField(max_length=50,choices=PaymentStatus.choices,default=PaymentStatus.PENDING)
    transaction_id = models.CharField(max_length=100,blank=True,help_text="Payment gateway reference or receipt number")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Receipt fields
    receipt_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    receipt_issued_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)

    def issue_receipt(self):
        if not self.receipt_number:
            self.receipt_number = f"RCP-{timezone.now().strftime('%Y%m%d')}-{self.id:04d}"
            self.receipt_issued_at = timezone.now()
            self.status = self.PaymentStatus.COMPLETED
            self.save()

    def __str__(self):
        return f"Payment #{self.id} - {self.amount} ({self.status})"

    class Meta:
        ordering = ['-payment_date']
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'


@receiver(post_save, sender=Invoice)
def create_invoice_items(sender, instance, created, **kwargs):
    """
    Signal receiver that creates invoice items when a new Invoice is created
    """
    if created:
        instance.create_invoice_items_from_booking()
        print(f"Created invoice items for invoice {instance.invoice_number}")

    