# 解决Ubuntu apt update提示文件invalid问题

在本地虚拟机中 Ubuntu 20.04 在执行 `sudo apt update`的时候，提示如下错误：


```plain text
ge@master:~$ sudo apt-get update
Hit:1 http://cn.archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://cn.archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:3 http://cn.archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]
Get:4 http://cn.archive.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Reading package lists... Done
E: Release file for http://cn.archive.ubuntu.com/ubuntu/dists/focal-updates/InRelease is not valid yet (invalid for another 3d 4h 8min 49s). Updates for this repository will not be applied.
E: Release file for http://cn.archive.ubuntu.com/ubuntu/dists/focal-backports/InRelease is not valid yet (invalid for another 3d 4h 10min 11s). Updates for this repository will not be applied.
E: Release file for http://cn.archive.ubuntu.com/ubuntu/dists/focal-security/InRelease is not valid yet (invalid for another 3d 4h 7min 53s). Updates for this repository will not be applied.
```

解决办法：

步骤一：确认系统时钟是否同步 System clock synchronized，命令 `timedatectl status`，如下代码所示：


```plain text
ge@master:~$ timedatectl status
               Local time: Mon 2022-06-27 03:56:18 UTC
           Universal time: Mon 2022-06-27 03:56:18 UTC
                 RTC time: Thu 2022-06-23 21:44:52
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

如果 System clock synchronized: no ，那么需要设置同步，`sudo timedatectl set-ntp true`

步骤二：设置系统时钟

命令为: `hwclock --hctosys`

完成之后，再次执行 `sudo apt update`不会在出现关于时间的错误。

