const db = require('../config/db');
class User {
  //#region INSERT
  static async create(userData) {
    const { username, email, password, active, fname, lname, role = 'user' } = userData;
    try {
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, active, fname, lname, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, password, active, fname, lname, role]
      );
      return result.insertId;
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }
  }
  //#endregion
  static async updateUser(userData) {
    const { id, username, fname, lname } = userData; 
    try {
      const [rows] = await db.query('UPDATE users SET username = ?, fname = ?, lname = ? WHERE id = ?', [username, fname, lname, id]);
      return rows[0];
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  }  


  //#region SELECT
  static async findByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw new Error('Erreur lors de la recherche de l\'utilisateur');
    }
  }  
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, username, email, role, active, fname, lname FROM users WHERE id = ?', 
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  }
  static async findByUsernameOrEmail(identifiant) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [identifiant, identifiant]
      );
      return rows[0];

    } catch (error) {
      throw new Error('Erreur lors de la recherche de l\'utilisateur');
    }
  }

  static async getUserByUsername(username) {
    try {
      const [rows] = await db.query('SELECT id, username, email, role, active, profile_picture FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  } 
  static async getAllUsers() {
    try {
      const [rows] = await db.query('SELECT id, username, email, role, active, fname, lname FROM users');
      return rows;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  }
  static async getUserById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, username, email, role, active, fname, lname FROM users WHERE id = ?', 
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  }
  static async getUsersByRole(role) {
    try {
      const [rows] = await db.query(
        'SELECT id, username, email, role, active, fname, lname FROM users WHERE role = ?',
        [role]
      );
      return rows;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des utilisateurs par rôle');
    }
  }
  static async getUsersByStatus(active) {
    try {
      const [rows] = await db.query(
        'SELECT id, username, email, role, active, fname, lname FROM users WHERE active = ?',
        [active]
      );
      return rows;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des utilisateurs par statut');
    }
  }
  static async searchUsers(searchTerm) {
    try {
      const [rows] = await db.query(
          `SELECT id, username, email, role, fname, lname 
         FROM users 
         WHERE username LIKE ? OR email LIKE ? OR fname LIKE ? OR lname LIKE ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;  
    } catch (error) {
      throw new Error('Erreur lors de la recherche des utilisateurs');
    }
  }
    //#endregion
  //#region UPDATE
  static async updateResetToken(userId, resetToken) {
    try {
      await db.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
        [resetToken, userId]
      );
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du token de réinitialisation');
    }
  }
  static async updateProfilePicture(username, picturePath) {
    try {
      await db.query(
        'UPDATE users SET profile_picture = ? WHERE username = ?',
        [picturePath, username]
      );
      return true;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de la photo de profil');
    }
  }
  static async activateAccount(email) {
    try {
      await db.query(
        'UPDATE users SET active = 1 WHERE email = ?',
        [email]
      );
    } catch (error) {
      throw new Error('Erreur lors de l\'activation du compte');
    }
  }

  static async setConfirmationCode(email, confirmationCode) {
    try {
      await db.query(
        'UPDATE users SET confirmation_code = ?, confirmation_code_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?',
        [confirmationCode, email]
      );
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du code de confirmation');
    }
  }

  static async verifyConfirmationCode(email, code) {
    try {
      const [rows] = await db.query(
        'SELECT confirmation_code, confirmation_code_expires FROM users WHERE email = ? AND confirmation_code = ? AND confirmation_code_expires > NOW()',
        [email, code]
      );
      return rows.length > 0;
    } catch (error) {
      throw new Error('Erreur lors de la vérification du code de confirmation');
    }
  }

  static async clearConfirmationCode(email) {
    try {
      await db.query(
        'UPDATE users SET confirmation_code = NULL, confirmation_code_expires = NULL WHERE email = ?',
        [email]
      );
    } catch (error) {
      throw new Error('Erreur lors de la suppression du code de confirmation');
    }
  }
  //#endregion

  // Nouvelle méthode pour vérifier le rôle
  static async getUserRole(userId) {
    try {
      const [rows] = await db.query(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
      return rows[0]?.role || null;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du rôle utilisateur');
    }
  }
}

module.exports = User; 