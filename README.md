# Gambit

Gambit adalah sebuah sistem tracker habit yang menerapkan unsur gamify, gambit menjadikan habit mu menjadi daily quest, yang bisa kamu selesaikan untuk mendapatkan mata uang untuk mendapatkan cosmetic yang langka.

## Description

Gambit dirancang untuk meningkatkan produktivitas personal dengan menjembatani rutinitas harian dan sistem penghargaan (reward system) RPG yang adiktif. Pengguna dapat menyelesaikan "Daily Quest" (kebiasaan/habit) yang telah disesuaikan untuk mendapatkan Gems (`💎`), yang kemudian digunakan sebagai mata uang utama untuk melakukan *pull* gacha dari kumpulan hadiah yang tersedia. 

## Getting Started

### Dependencies

* **Frontend:** Node.js (v18 atau lebih tinggi), package manager seperti npm/pnpm/yarn.
* **Backend:** Node.js (v20 atau lebih tinggi) dengan framework Express.
* **Database:** PostgreSQL (v14 atau lebih tinggi).
* **Jaringan & OS:** Browser modern desktop atau mobile.

### Installing

1. Clone repositori ini ke komputer lokalmu.
2. **Setup Backend:**
   * Masuk ke folder server dan instal driver database serta dependensi yang diperlukan:
     ```bash
     npm install pg cors dotenv express
     ```
   * Buat file `.env` di root folder backend dan masukkan kredensial PostgreSQL kamu:
     ```env
     DATABASE_URL=string_koneksi_postgresql_kamu
     PORT=5000
     ```
3. **Setup Frontend:**
   * Masuk ke folder client dan instal dependensi UI (framework Tailwind CSS v4 sudah langsung termasuk di dalamnya):
     ```bash
     npm install
     ```

### Executing program

1. Jalankan client:
  ```
   npm run dev
  ```
2. Jalankan server:
  ```
   node server.js
  ```
<!-- ## Help

Any advise for common problems or issues.
```
command to run if program contains helper info
``` -->

## Authors

Contributors names and contact info

* @arpusauri

## Version History

For detailed release notes, full patch history, and updates for every version - see the [releases page](https://github.com/arpusauri/habit-daily-quest/releases).

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/arpusauri/habit-daily-quest/blob/main/LICENSE.md) file for details.

<!-- ## Acknowledgments -->

