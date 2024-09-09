using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;

public class SkillHubContext : DbContext
{
    public SkillHubContext(DbContextOptions<SkillHubContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<SubCategory> SubCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configurazione della relazione tra User e Service (1-N)
        modelBuilder.Entity<Service>()
            .HasOne(s => s.User)
            .WithMany(u => u.Services)
            .HasForeignKey(s => s.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configurazione della relazione tra Service e Category (1-N)
        modelBuilder.Entity<Service>()
            .HasOne(s => s.Category)
            .WithMany(c => c.Services)
            .HasForeignKey(s => s.CategoryID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Service e SubCategory (1-N)
        modelBuilder.Entity<Service>()
            .HasOne(s => s.SubCategory)
            .WithMany(sc => sc.Services)
            .HasForeignKey(s => s.SubCategoryID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Message e User per Sender (1-N)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Message e User per Receiver (1-N)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Order e User per Client (1-N)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Client)
            .WithMany(u => u.ClientOrders)
            .HasForeignKey(o => o.ClientID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Order e User per Freelancer (1-N)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Freelancer)
            .WithMany(u => u.FreelancerOrders)
            .HasForeignKey(o => o.FreelancerID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Order e Service (1-N)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Service)
            .WithMany(s => s.Orders)
            .HasForeignKey(o => o.ServiceID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configurazione della relazione tra Review e Order (1-1)
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Order)
            .WithOne(o => o.Review)
            .HasForeignKey<Review>(r => r.OrderID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configurazione della relazione tra Review e User (optional, può essere aggiunta se necessario)
        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurazione della relazione tra Category e SubCategory (1-N)
        modelBuilder.Entity<SubCategory>()
            .HasOne(sc => sc.Category)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(sc => sc.CategoryID)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}
