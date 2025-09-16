using Microsoft.AspNetCore.Mvc.RazorPages;
using Dapper;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;

public class UsersModel : PageModel
{
    public IList<UserDto> Users { get; set; } = new List<UserDto>();

    public async Task OnGetAsync()
    {
        var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "app.db");
        var connectionString = $"Data Source={dbPath}";

        using var connection = new SqliteConnection(connectionString);
        await connection.OpenAsync();

        var sql = "SELECT Id, Email, UserName FROM AspNetUsers";
        var users = await connection.QueryAsync<UserDto>(sql);

        Users = users.AsList();
    }
}